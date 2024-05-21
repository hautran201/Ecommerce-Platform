'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'Discounts';

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
    {
        discount_name: { type: String, required: true },
        discount_description: { type: String, required: true },
        discount_type: {
            type: String,
            default: 'fixed_amount', // percentage
        },
        discount_value: { type: Number, required: true },
        discount_code: { type: String, required: true }, //discount code
        discount_start_date: { type: Date, required: true }, // ngay ket thuc
        discount_end_date: { type: Date, required: true }, // ngay bat dau
        discount_max_uses: { type: Number, required: true }, // so luong discount duoc ap dung
        discount_user_count: { type: Number, required: true }, // so discount da su dung
        discount_users_used: { type: Array, default: [] }, //ai su dung
        discount_max_uses_per_user: { type: Number, required: true }, //so luong cho phep toi da duoc su dung
        discount_min_order_value: { type: Number, required: true }, //
        discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },

        discount_is_active: { type: Boolean, default: true },
        discount_applies_to: {
            type: String,
            required: true,
            enum: ['all', 'specific'],
        },
        discount_product_ids: { type: Array, default: [] }, //
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
