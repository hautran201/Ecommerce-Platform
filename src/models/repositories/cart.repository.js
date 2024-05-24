'use strict';

const { convertToObjectIdMongodb } = require('../../utils');
const { cart } = require('../cart.model');

const createUserCart = async ({ userId, product }) => {
    const query = { cart_userId: userId, cart_status: 'active' },
        updateOrIsert = {
            $addToSet: {
                cart_products: product,
            },
        },
        options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrIsert, options);
};

const updateUserCartQuantity = async ({ userId, product }) => {
    const { productId, quantity } = product;

    const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_status: 'active',
        },
        updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity,
            },
        },
        options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateSet, options);
};

const findCartById = async (cartId) => {
    return await cart
        .findById({
            _id: convertToObjectIdMongodb(cartId),
            cart_status: 'active',
        })
        .lean();
};

module.exports = {
    createUserCart,
    updateUserCartQuantity,
    findCartById,
};
