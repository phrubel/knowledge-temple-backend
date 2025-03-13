'use strict';

const router = require('express').Router();
const userRoutes = require('../../routes/user/userRoutes');
const courseRoutes = require('../../routes/user/courseRoutes');
const materialRoutes = require('../../routes/user/materialRoutes');
const quizRoutes = require('../../routes/user/quizRoutes');
const activityRoutes = require('../../routes/user/activityRoutes');
const boardRoutes = require('../../routes/user/boardRoutes');
const standardRoutes = require('../../routes/user/standardRoutes');
const subjectRoutes = require('../../routes/user/subjectRoute');
const offerRoutes = require('../../routes/user/offerRoutes');
const mentorRoutes = require('../../routes/user/mentorRoutes');
const trackingRoutes = require('../../routes/user/courseTrackingRoutes');
const streamRoutes = require('../../routes/user/streamRoutes');

router.use(userRoutes);

router.use('/course', courseRoutes);

router.use('/material', materialRoutes);

router.use('/quiz', quizRoutes);

router.use('/stream', streamRoutes);

router.use(activityRoutes);

router.use(boardRoutes);

router.use(standardRoutes);

router.use(subjectRoutes);

router.use(offerRoutes);

router.use(mentorRoutes);

router.use(trackingRoutes);

module.exports = router;
