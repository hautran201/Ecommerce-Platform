'use strict';

const { CREATED, SuccessReponse } = require('../core/success.response');
const CheckoutService = require('../services/checkout.service');

class CheckoutController {
    async checkoutReview(req, res, next) {
        new SuccessReponse({
            message: 'Checkout Reviewed',
            metadata: await CheckoutService.checkoutReview(req.body),
        }).send(res);
    }
}

module.exports = new CheckoutController();
