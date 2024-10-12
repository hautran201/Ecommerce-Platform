const express = require('express');
const NotificationController = require('../../controllers/notification.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');

const router = express.Router();

//Here not login

//authentication //
router.use(authentication);

// POST //
router.get('', asyncHandler(NotificationController.listNotiByUser));

module.exports = router;
