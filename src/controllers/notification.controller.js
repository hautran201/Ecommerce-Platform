'use strict';

const NotificationService = require('../services/notification.service');
const { SuccessReponse } = require('../core/success.response');

class CommentController {
    listNotiByUser = async (req, res, next) => {
        new SuccessReponse({
            message: 'Get  Comment success',
            metadata: await NotificationService.listNotiByUser(req.query),
        }).send(res);
    };
}

module.exports = new CommentController();
