const express = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const pageController = require('../controllers/pageController');
const blockController = require('../controllers/blockController');
const { createPageSchema, updatePageSchema } = require('../validators/pageValidators');
const { createBlockSchema, updateBlockSchema, reorderSchema } = require('../validators/blockValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', pageController.listPages);
router.post('/', validate(createPageSchema), pageController.createPage);
router.get('/:id', pageController.getPage);
router.patch('/:id', validate(updatePageSchema), pageController.updatePage);
router.delete('/:id', pageController.deletePage);

router.post('/:pageId/blocks', validate(createBlockSchema), blockController.createBlock);
router.patch('/:pageId/blocks/reorder', validate(reorderSchema), blockController.reorderBlocks);

module.exports = router;

// Individual block mutation (not page-scoped in the URL) lives on its own
// router mounted at /api/blocks — exported separately below for clarity.
module.exports.blockRouter = (() => {
  const blockRouter = express.Router();
  blockRouter.use(authenticate);
  blockRouter.patch('/:id', validate(updateBlockSchema), blockController.updateBlock);
  blockRouter.delete('/:id', blockController.deleteBlock);
  return blockRouter;
})();
