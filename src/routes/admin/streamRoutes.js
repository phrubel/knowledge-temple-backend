const express = require('express');
const {
  fetchStream,
  startStream,
  stopStream,
  getViewers,
} = require('../../controllers/admin/streamcontroller');
const router = express.Router();

// router.get('/', fetchStream);
router.post('/start-stream', startStream);
router.post('/stop-stream', stopStream);
router.get('/getViewers', getViewers);

module.exports = router;
