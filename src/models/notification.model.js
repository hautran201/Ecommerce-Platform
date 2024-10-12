'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

const notificationSchema = new Schema(
    {
        noti_type: {
            type: String,
            enum: ['ORDER_001', 'ORDER_002', 'PROMOTION_001', 'SHOP_001'],
            required: true,
        },
        noti_senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Shop',
        },
        noti_receiverId: { type: Number, required: true },
        noti_content: { type: String, required: true },
        noti_options: { type: Object, default: {} },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

module.exports = model(DOCUMENT_NAME, notificationSchema);
