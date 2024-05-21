'use strict';

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const DiscountController = require('../../controllers/discount.controller');

const router = express.Router();

router.get('/amount', asyncHandler(DiscountController.getDiscountAmount));
router.get(
    '/list_product',
    asyncHandler(DiscountController.getAllDiscountCodesWithProduct)
);

//authentication //
router.use(authentication);

// POST //
router.post('', asyncHandler(DiscountController.createDiscountCode));

router.get('', asyncHandler(DiscountController.getAllDiscountCodes));
// END POST //

// QUERY //

// END QUERY //

module.exports = router;
