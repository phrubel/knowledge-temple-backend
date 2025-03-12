const express = require('express');
const {
  fetchStream,
  startStream,
  stopStream,
  getViewers,
  fetchUpcomingLive,
} = require('../../controllers/admin/streamcontroller');
const router = express.Router();

// router.get('/', fetchStream);
router.post('/start-stream', startStream);
router.get('/upcoming-stream', fetchUpcomingLive);
router.post('/stop-stream', stopStream);
router.get('/getViewers', getViewers);

module.exports = router;
