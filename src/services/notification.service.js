'use strict';

const Notification = require('../models/notification.model');

class NotificationService {
    static async pushNotiToSystem({
        type = 'SHOP_001',
        senderId = 1,
        receiverId = 1,
        options = {},
    }) {
        let noti_content;
        if (type === 'SHOP_001') {
            noti_content = `@@@ vua moi them mot san pham @@@@`;
        } else if (type === 'PROMOTION_001') {
            noti_content = `@@@ vua moi them mot voucher: @@@@@`;
        }

        const newNoti = await Notification.create({
            noti_type: type,
            noti_senderId: senderId,
            noti_receiverId: receiverId,
            noti_content: noti_content,
            noti_options: options,
        });

        return newNoti;
    }

    static async listNotiByUser({ userId = 1, type = 'ALL', isRead = 0 }) {
        const match = { noti_receiverId: userId };
        if (type !== 'ALL') {
            match['noti_type'] = type;
        }

        return await Notification.aggregate([
            {
                $match: match,
            },
            {
                $project: {
                    noti_type: 1,
                    noti_receiverId: 1,
                    noti_senderId: 1,
                    noti_content: {
                        $concat: [
                            { $substr: ['$noti_options.shop_name', 0, -1] },
                            ' vua moi them mot san pham  ',
                            { $substr: ['$noti_options.product_name', 0, -1] },
                        ],
                    },
                    noti_options: 1,
                    noti_createdAt: 1,
                },
            },
        ]);
    }
}

module.exports = NotificationService;
