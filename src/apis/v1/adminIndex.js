'use strict';

const router = require('express').Router();
const subjectRoutes = require('../../routes/admin/subjectRoutes');
const lessonRoutes = require('../../routes/admin/lessonRoutes');
const standardRoutes = require('../../routes/admin/standardRoutes');
const materialRoutes = require('../../routes/admin/materialRouter');
const boardRoutes = require('../../routes/admin/boardRoutes');
const activityRoutes = require('../../routes/admin/activityRoutes');
const courseRoutes = require('../../routes/admin/courseRoutes');
const quizRoutes = require('../../routes/admin/quizRoutes');
const authRoutes = require('../../routes/admin/authRoutes');
const userRoute = require('../../routes/admin/userRoutes');
const paymentRoute = require('../../routes/admin/paymentRoutes');
const offerRooute = require('../../routes/admin/offerRoutes');
// const courseReviewRoutes = require("../../routes/admin/coursereview");
const mentorRoutes = require('../../routes/admin/mentorRoutes');
const streamRoutes = require('../../routes/admin/streamRoutes');

router.use(authRoutes);
router.use('/subject', subjectRoutes);
router.use('/lesson', lessonRoutes);
router.use('/standard', standardRoutes);
router.use('/material', materialRoutes);
router.use('/board', boardRoutes);
router.use('/activity', activityRoutes);
router.use('/course', courseRoutes);
router.use('/quiz', quizRoutes);
router.use('/user', userRoute);
router.use('/payment', paymentRoute);
router.use('/offer', offerRooute);
// router.use("/review", courseReviewRoutes);
router.use('/mentor', mentorRoutes);
router.use('/stream', streamRoutes);

module.exports = router;
