const slugify = require('slugify');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

async function uniqueSlug(base) {
  let slug = slugify(base, { lower: true, strict: true });
  if (!slug) slug = 'page';
  let candidate = slug;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.page.findUnique({ where: { slug: candidate } })) {
    i += 1;
    candidate = `${slug}-${i}`;
  }
  return candidate;
}

// GET /api/pages  (admin) — list all pages regardless of status
const listPages = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);
  const status = req.query.status;

  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { blocks: true } } },
    }),
    prisma.page.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// GET /api/pages/:id  (admin) — full page with ordered blocks
const getPage = asyncHandler(async (req, res) => {
  const page = await prisma.page.findUnique({
    where: { id: req.params.id },
    include: { blocks: { orderBy: { order: 'asc' } } },
  });
  if (!page) throw ApiError.notFound('Page not found');
  res.json({ success: true, data: page });
});

// POST /api/pages  (admin)
const createPage = asyncHandler(async (req, res) => {
  const { title, slug, status, seoTitle, seoDescription, ogImage } = req.body;
  const finalSlug = slug ? slug : await uniqueSlug(title);

  const existing = await prisma.page.findUnique({ where: { slug: finalSlug } });
  if (existing) throw ApiError.conflict(`Slug "${finalSlug}" is already in use`);

  const page = await prisma.page.create({
    data: {
      title,
      slug: finalSlug,
      status: status || 'DRAFT',
      seoTitle,
      seoDescription,
      ogImage,
      createdById: req.admin.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });

  res.status(201).json({ success: true, data: page });
});

// PATCH /api/pages/:id  (admin)
const updatePage = asyncHandler(async (req, res) => {
  const existing = await prisma.page.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Page not found');

  if (req.body.slug && req.body.slug !== existing.slug) {
    const clash = await prisma.page.findUnique({ where: { slug: req.body.slug } });
    if (clash) throw ApiError.conflict(`Slug "${req.body.slug}" is already in use`);
  }

  const becomingPublished = req.body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';

  const page = await prisma.page.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      publishedAt: becomingPublished ? new Date() : existing.publishedAt,
    },
  });

  res.json({ success: true, data: page });
});

// DELETE /api/pages/:id  (admin)
const deletePage = asyncHandler(async (req, res) => {
  const existing = await prisma.page.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Page not found');
  await prisma.page.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---- Public (unauthenticated) endpoints ----

// GET /api/public/pages — published pages only, lightweight list for nav
const listPublicPages = asyncHandler(async (req, res) => {
  const pages = await prisma.page.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, title: true, publishedAt: true },
    orderBy: { title: 'asc' },
  });
  res.json({ success: true, data: pages });
});

// GET /api/public/pages/:slug — full published page with ordered blocks
const getPublicPage = asyncHandler(async (req, res) => {
  const page = await prisma.page.findUnique({
    where: { slug: req.params.slug },
    include: { blocks: { orderBy: { order: 'asc' } } },
  });
  if (!page || page.status !== 'PUBLISHED') {
    throw ApiError.notFound('Page not found');
  }
  res.json({ success: true, data: page });
});

module.exports = {
  listPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  listPublicPages,
  getPublicPage,
};
