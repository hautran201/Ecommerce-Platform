const express = require('express');
const CommentController = require('../../controllers/comment.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');

const router = express.Router();

//authentication //
router.use(authentication);

// POST //
router.post('', asyncHandler(CommentController.createComment));
router.delete('', asyncHandler(CommentController.deleteComment));
router.get('', asyncHandler(CommentController.getCommentsByParentId));

module.exports = router;
