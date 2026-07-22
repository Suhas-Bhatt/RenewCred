const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@renewcred.dev' },
    update: {},
    create: {
      name: 'Suhas (Super Admin)',
      email: 'admin@renewcred.dev',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`Seeded admin: ${admin.email} / password: ChangeMe123!`);

  const home = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      slug: 'home',
      title: 'Home',
      status: 'PUBLISHED',
      seoTitle: 'RenewCred — Renewable Energy Financing',
      seoDescription: 'Sample CMS-managed homepage.',
      createdById: admin.id,
      publishedAt: new Date(),
      blocks: {
        create: [
          {
            type: 'HEADING',
            order: 0,
            data: { level: 1, content: [{ text: 'Financing the transition to clean energy' }] },
          },
          {
            type: 'PARAGRAPH',
            order: 1,
            data: {
              content: [
                { text: 'This entire page is rendered from the CMS — ' },
                { text: 'nothing you see here is hardcoded', bold: true },
                { text: ' on the frontend.' },
              ],
            },
          },
          {
            type: 'LIST',
            order: 2,
            data: {
              ordered: false,
              items: [
                {
                  content: [{ text: 'Solar' }],
                  children: [
                    { content: [{ text: 'Residential rooftop' }] },
                    { content: [{ text: 'Utility-scale' }] },
                  ],
                },
                { content: [{ text: 'Wind' }] },
                { content: [{ text: 'Battery storage' }] },
              ],
            },
          },
          {
            type: 'CALLOUT',
            order: 3,
            data: { tone: 'info', content: [{ text: 'Every block below is editable from /admin.' }] },
          },
        ],
      },
    },
  });

  const docs = await prisma.page.upsert({
    where: { slug: 'documentation' },
    update: {},
    create: {
      slug: 'documentation',
      title: 'Technical Documentation',
      status: 'PUBLISHED',
      createdById: admin.id,
      publishedAt: new Date(),
      blocks: {
        create: [
          {
            type: 'HEADING',
            order: 0,
            data: { level: 1, content: [{ text: 'Levelized Cost of Energy (LCOE)' }] },
          },
          {
            type: 'PARAGRAPH',
            order: 1,
            data: { content: [{ text: 'LCOE is calculated as the total lifetime cost divided by total lifetime energy output:' }] },
          },
          {
            type: 'MATH',
            order: 2,
            data: {
              latex: 'LCOE = \\frac{\\sum_{t=1}^{n} \\frac{C_t}{(1+r)^t}}{\\sum_{t=1}^{n} \\frac{E_t}{(1+r)^t}}',
              displayMode: true,
            },
          },
          {
            type: 'TABLE',
            order: 3,
            data: {
              headers: ['Technology', 'LCOE (₹/kWh)', 'Payback (yrs)'],
              rows: [
                ['Rooftop Solar', '2.8', '5'],
                ['Onshore Wind', '3.1', '7'],
                ['Battery Storage', '5.4', '9'],
              ],
            },
          },
          {
            type: 'CODE',
            order: 4,
            data: { language: 'javascript', code: 'const lcoe = totalCost / totalEnergyOutput;' },
          },
          {
            type: 'QUOTE',
            order: 5,
            data: { content: [{ text: 'Every kilowatt-hour has a story of cost and carbon behind it.' }], cite: 'RenewCred Research Note' },
          },
          { type: 'DIVIDER', order: 6, data: {} },
        ],
      },
    },
  });

  console.log(`Seeded pages: /${home.slug}, /${docs.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
