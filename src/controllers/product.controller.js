'use strict';

const { CREATED, SuccessReponse } = require('../core/success.response');
const ProductService = require('../services/product.service');

class AccessController {
    createProduct = async (req, res, next) => {
        new CREATED({
            message: ' Create New Product Success!',
            metadata: await ProductService.createProduct(
                req.body.product_type,
                { ...req.body, product_shop: req.user.userId }
            ),
        }).send(res);
    };
}

module.exports = new AccessController();
