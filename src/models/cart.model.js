'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

// Declare the Schema of the Mongo model
var cartSchema = new Schema(
    {
        cart_status: {
            type: String,
            enum: ['active', 'complete', 'failed', 'pending'],
            default: 'active',
        },
        cart_products: {
            type: Array,
            required: true,
            default: [],
        },
        cart_count_product: {
            type: Number,
            default: 0,
        },
        cart_userId: { type: Number, required: true },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema),
};
