'use strict';

const {
  fetchStream,
  getAllUpcomingStream,
} = require('../../controllers/admin/streamcontroller');

const router = require('express').Router();

router.get('/', fetchStream);
router.get('/upcoming-live', getAllUpcomingStream);

module.exports = router;
