const express = require('express');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

router.use(authenticate);
router.post('/', upload.single('file'), mediaController.uploadMedia);
router.get('/', mediaController.listMedia);

module.exports = router;
