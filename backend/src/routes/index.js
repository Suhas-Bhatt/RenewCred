const express = require('express');
const authRoutes = require('./authRoutes');
const pageRoutes = require('./pageRoutes');
const publicRoutes = require('./publicRoutes');
const mediaRoutes = require('./mediaRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/pages', pageRoutes);
router.use('/blocks', pageRoutes.blockRouter);
router.use('/public', publicRoutes);
router.use('/media', mediaRoutes);

module.exports = router;
