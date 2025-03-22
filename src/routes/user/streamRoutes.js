'use strict';

const {
  fetchStream,
  getAllUpcomingStream,
  getChatToken,
} = require('../../controllers/admin/streamcontroller');

const router = require('express').Router();

router.get('/', fetchStream);
router.post('/upcoming-live', getAllUpcomingStream);
router.post('/get-chat-token', getChatToken);

module.exports = router;
