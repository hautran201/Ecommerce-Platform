const express = require('express');
const ProductController = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');

const router = express.Router();

router.get('', asyncHandler(ProductController.getAllProducts));
router.get('/:id', asyncHandler(ProductController.getProduct));
router.get(
    '/search/:keySearch',
    asyncHandler(ProductController.getListSearchProduct)
);
//authentication //
router.use(authentication);

// POST //
router.post('', asyncHandler(ProductController.createProduct));
router.post(
    '/publish/:id',
    asyncHandler(ProductController.publishProductByShop)
);
router.post(
    '/unpublish/:id',
    asyncHandler(ProductController.unPublishProductByShop)
);

// END POST //

// QUERY //
router.get('/drafts/all', asyncHandler(ProductController.getAllDraftsForShop));
router.get(
    '/publish/all',
    asyncHandler(ProductController.getAllPublishForShop)
);

// END QUERY //

module.exports = router;
