const express = require('express');
const pageController = require('../controllers/pageController');

const router = express.Router();

router.get('/pages', pageController.listPublicPages);
router.get('/pages/:slug', pageController.getPublicPage);

module.exports = router;
