'use strict';

const { CREATED, SuccessReponse } = require('../core/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
    async createDiscountCode(req, res, next) {
        new CREATED({
            message: 'Discount Code Created',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    }

    async getAllDiscountCodes(req, res, next) {
        new SuccessReponse({
            message: 'Get All Discount Code Success',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId,
            }),
        }).send(res);
    }

    async getDiscountAmount(req, res, next) {
        new SuccessReponse({
            message: 'Get All Discount Code Success',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            }),
        }).send(res);
    }
    async getAllDiscountCodesWithProduct(req, res, next) {
        console.log(req.query);
        new SuccessReponse({
            message: 'Get All Discount Code Success',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            }),
        }).send(res);
    }
}

module.exports = new DiscountController();
