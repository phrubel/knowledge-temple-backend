const express = require('express');
const {
  fetchStream,
  startStream,
  stopStream,
} = require('../../controllers/admin/streamcontroller');
const router = express.Router();

router.get('/', fetchStream);
router.post('/start-stream', startStream);
router.post('/stop-stream', stopStream);

module.exports = router;
