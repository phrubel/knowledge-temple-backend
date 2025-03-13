const express = require('express');
const {
  startStream,
  stopStream,
  getViewers,
  createUpcomingLive,
  getAllUpcomingStream,
} = require('../../controllers/admin/streamcontroller');
const router = express.Router();

router.get('/', getAllUpcomingStream);
router.post('/create-stream', createUpcomingLive);
router.post('/start-stream/:id', startStream);
router.post('/stop-stream', stopStream);
router.get('/getViewers', getViewers);

module.exports = router;
