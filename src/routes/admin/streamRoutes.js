const express = require('express');
const {
  startStream,
  stopStream,
  getViewers,
  createUpcomingLive,
  getAllUpcomingStream,
  getChatToken,
} = require('../../controllers/admin/streamcontroller');
const router = express.Router();

router.post('/', getAllUpcomingStream);
router.post('/create-stream', createUpcomingLive);
router.post('/start-stream/:id', startStream);
router.post('/stop-stream', stopStream);
router.post('/getViewers', getViewers);
router.post('/get-chat-token', getChatToken);

module.exports = router;
