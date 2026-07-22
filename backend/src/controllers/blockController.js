const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { validateBlockData } = require('../validators/blockValidators');

// POST /api/pages/:pageId/blocks
const createBlock = asyncHandler(async (req, res) => {
  const { pageId } = req.params;
  const { type, order, data } = req.body;

  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) throw ApiError.notFound('Page not found');

  const check = validateBlockData(type, data);
  if (!check.success) {
    throw ApiError.badRequest(`Invalid data for block type ${type}`, check.error);
  }

  const block = await prisma.block.create({
    data: { pageId, type, order, data: check.data },
  });

  res.status(201).json({ success: true, data: block });
});

// PATCH /api/blocks/:id
const updateBlock = asyncHandler(async (req, res) => {
  const existing = await prisma.block.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Block not found');

  const nextType = req.body.type || existing.type;
  const nextData = req.body.data !== undefined ? req.body.data : existing.data;

  const check = validateBlockData(nextType, nextData);
  if (!check.success) {
    throw ApiError.badRequest(`Invalid data for block type ${nextType}`, check.error);
  }

  const block = await prisma.block.update({
    where: { id: req.params.id },
    data: {
      type: nextType,
      data: check.data,
      order: req.body.order !== undefined ? req.body.order : existing.order,
    },
  });

  res.json({ success: true, data: block });
});

// DELETE /api/blocks/:id
const deleteBlock = asyncHandler(async (req, res) => {
  const existing = await prisma.block.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Block not found');
  await prisma.block.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// PATCH /api/pages/:pageId/blocks/reorder
// Body: { blocks: [{ id, order }, ...] } — bulk reorder in a transaction so
// a partial failure never leaves the page in an inconsistently ordered state.
const reorderBlocks = asyncHandler(async (req, res) => {
  const { pageId } = req.params;
  const { blocks } = req.body;

  const ids = blocks.map((b) => b.id);
  const existingCount = await prisma.block.count({ where: { id: { in: ids }, pageId } });
  if (existingCount !== ids.length) {
    throw ApiError.badRequest('One or more blocks do not belong to this page');
  }

  await prisma.$transaction(
    blocks.map((b) => prisma.block.update({ where: { id: b.id }, data: { order: b.order } }))
  );

  const updated = await prisma.block.findMany({ where: { pageId }, orderBy: { order: 'asc' } });
  res.json({ success: true, data: updated });
});

module.exports = { createBlock, updateBlock, deleteBlock, reorderBlocks };
