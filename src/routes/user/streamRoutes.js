'use strict';

const {
  fetchStream,
  getAllUpcomingStream,
} = require('../../controllers/admin/streamcontroller');

const router = require('express').Router();

router.get('/', fetchStream);
router.post('/upcoming-live', getAllUpcomingStream);

module.exports = router;
