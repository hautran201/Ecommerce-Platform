'use strict';

const CommentService = require('../services/comment.service');
const { SuccessReponse } = require('../core/success.response');

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessReponse({
            message: 'Created Comment success',
            metadata: await CommentService.createComment(req.body),
        }).send(res);
    };
    getCommentsByParentId = async (req, res, next) => {
        new SuccessReponse({
            message: 'Get  Comment success',
            metadata: await CommentService.getCommentsByParentId(req.query),
        }).send(res);
    };
    deleteComment = async (req, res, next) => {
        new SuccessReponse({
            message: 'Delete  Comment success',
            metadata: await CommentService.deleteComment(req.body),
        }).send(res);
    };
}

module.exports = new CommentController();
