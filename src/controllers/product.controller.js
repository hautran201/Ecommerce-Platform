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

    updateProduct = async (req, res, next) => {
        new SuccessReponse({
            message: ' Update Product Success!',
            metadata: await ProductService.updateProduct(
                req.body.product_type,
                req.params.productId,
                { ...req.body, product_shop: req.user.userId }
            ),
        }).send(res);
    };

    /**
     * @description Publish product for Shop
     * @param {ObjectId} product_id
     * @return {JSON}
     */
    publishProductByShop = async (req, res, next) => {
        new CREATED({
            message: 'Publish Product for Shop Success!',
            metadata: await ProductService.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @description unPublish product for Shop
     * @param {ObjectId} product_id
     * @return {JSON}
     */
    unPublishProductByShop = async (req, res, next) => {
        new CREATED({
            message: 'Publish Product for Shop Success!',
            metadata: await ProductService.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    // QUERY //
    /**
     * @description Get all Draft for Shop
     * @param {number} limit
     * @param {number} skip
     * @return {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessReponse({
            message: ' Get list Draft Success!',
            metadata: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };
    /**
     * @description Get all Publish for Shop
     * @param {number} limit
     * @param {number} skip
     * @return {JSON}
     */
    getAllPublishForShop = async (req, res, next) => {
        new SuccessReponse({
            message: ' Get list Draft Success!',
            metadata: await ProductService.findAllPublishedForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessReponse({
            message: ' Search product Success!',
            metadata: await ProductService.getListSearchProduct(req.params),
        }).send(res);
    };

    getAllProducts = async (req, res, next) => {
        new SuccessReponse({
            message: ' Get All product Success!',
            metadata: await ProductService.getAllProducts(req.query),
        }).send(res);
    };

    getProduct = async (req, res, next) => {
        new SuccessReponse({
            message: ' Get product Success!',
            metadata: await ProductService.getProduct({
                product_id: req.params.id,
            }),
        }).send(res);
    };

    // END QUERY //
}

module.exports = new AccessController();
