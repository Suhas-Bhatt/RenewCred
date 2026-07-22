const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/media (multipart/form-data, field name "file")
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const media = await prisma.media.create({
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });

  res.status(201).json({ success: true, data: media });
});

// GET /api/media
const listMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: media });
});

module.exports = { uploadMedia, listMedia };
