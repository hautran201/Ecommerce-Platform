'use strict';

const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const CartController = require('../../controllers/cart.controller');

const router = express.Router();

router.post('', asyncHandler(CartController.addToCart));
router.delete('', asyncHandler(CartController.delete));
router.post('/update', asyncHandler(CartController.updateToCart));
router.get('', asyncHandler(CartController.getListUserCart));

module.exports = router;
