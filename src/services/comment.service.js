'use strict';

const Comment = require('../models/comment.model');
const { convertToObjectIdMongodb, getSelectData } = require('../utils');
const { findProduct } = require('../models/repositories/product.repository');
const { NotFoundError } = require('../core/error.response');

class CommentService {
    static async createComment({
        productId,
        userId,
        content,
        parentCommentId = null,
    }) {
        const comment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId,
        });

        let rightValue;
        if (parentCommentId) {
            //reply
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                throw new NotFoundError('Parent comment not found!');
            }
            rightValue = parentComment.comment_right;
            //update Many comment
            await Comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_right: { $gte: rightValue },
                },
                {
                    $inc: {
                        comment_right: 2,
                    },
                }
            );

            await Comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_left: { $gt: rightValue },
                },
                {
                    $inc: {
                        comment_left: 2,
                    },
                }
            );
        } else {
            const maxRightValue = await Comment.findOne(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                },
                'comment_right',
                { sort: { comment_right: -1 } }
            );
            if (maxRightValue) {
                rightValue = maxRightValue.right + 1;
            } else {
                rightValue = 1;
            }
        }

        //insert to comment
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;

        await comment.save();
        return comment;
    }

    static async getCommentsByParentId({
        productId,
        parentCommentId,
        limit = 50,
        offset = 0,
    }) {
        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent) {
                throw new NotFoundError('Parent comment not found!');
            }

            const comments = await Comment.find({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: parent.comment_left },
                comment_right: { $lte: parent.comment_right },
            })
                .select(
                    getSelectData([
                        'comment_left',
                        'comment_right',
                        'comment_content',
                        'comment_parentId',
                    ])
                )
                .sort({ comment_left: 1 });
            return comments;
        }
        const comments = await Comment.find({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_parentId: parentCommentId,
        })
            .select(
                getSelectData([
                    'comment_left',
                    'comment_right',
                    'comment_content',
                    'comment_parentId',
                ])
            )
            .sort({ comment_left: 1 });
        return comments;
    }

    static async deleteComment({ commentId, productId }) {
        const foundProduct = await findProduct({
            product_id: convertToObjectIdMongodb(productId),
        });
        if (!foundProduct) throw new NotFoundError('Product not found!');

        const comment = await Comment.findById(commentId);
        if (!comment) throw new NotFoundError('Product not found!');

        const leftValue = comment.comment_left;
        const rightValue = comment.comment_right;

        console.log({ leftValue, rightValue });
        const width = rightValue - leftValue + 1;

        await Comment.deleteMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gte: leftValue, $lte: rightValue },
        });

        await Comment.updateMany(
            {
                comment_productId: convertToObjectIdMongodb(productId),
                comment_right: { $gt: rightValue },
            },
            {
                $inc: {
                    comment_right: -width,
                },
            }
        );
        await Comment.updateMany(
            {
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: leftValue },
            },
            {
                $inc: {
                    comment_left: -width,
                },
            }
        );
        return true;
    }
}

module.exports = CommentService;
