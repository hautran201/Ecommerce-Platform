'use strict';

const { Types } = require('mongoose');
const {
    product,
    clothing,
    electronic,
    furniture,
} = require('../product.model');
const {
    getSelectData,
    unGetSelectData,
    convertToObjectIdMongodb,
} = require('../../utils');

const queryProduct = async (query, limit, skip) => {
    return await product
        .find(query)
        .populate('product_shop', 'name email -_id')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return queryProduct(query, limit, skip);
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
    return queryProduct(query, limit, skip);
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();

    return products;
};

const findProduct = async ({ product_id, unSelect }) => {
    return await product
        .findById(product_id)
        .select(unGetSelectData(unSelect))
        .lean();
};

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    const result = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .lean();

    return result;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        _id: new Types.ObjectId(product_id),
        product_shop: new Types.ObjectId(product_shop),
    });

    if (!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;

    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        _id: new Types.ObjectId(product_id),
        product_shop: new Types.ObjectId(product_shop),
    });

    if (!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;

    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
};

const getProductById = async (productId) => {
    return await product
        .findOne({ _id: convertToObjectIdMongodb(productId) })
        .lean();
};

const checkProductByServer = async (products) => {
    return Promise.all(
        products.map(async (product) => {
            const foundProuct = await getProductById(product.productId);
            return {
                product_price: foundProuct.product_price,
                product_quantity: product.quantity,
                productId: product.productId,
            };
        })
    );
};

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true,
}) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, { new: isNew });
};

module.exports = {
    findAllDraftsForShop,
    findAllPublishedForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
};
