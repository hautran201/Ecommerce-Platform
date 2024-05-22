'use strict';

const { CREATED, SuccessReponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessReponse({
            message: 'Add To Cart Success',
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };

    updateToCart = async (req, res, next) => {
        new SuccessReponse({
            message: 'Add To Cart Success',
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    };

    delete = async (req, res, next) => {
        new SuccessReponse({
            message: 'Delete Cart Success',
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    };

    getListUserCart = async (req, res, next) => {
        new SuccessReponse({
            message: 'Get List Cart Success',
            metadata: await CartService.getListUserCart(req.query),
        }).send(res);
    };
}

module.exports = new CartController();
