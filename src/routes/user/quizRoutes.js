'use strict';

const router = require('express').Router();
const quizController = require('../../controllers/user/quizController');
const { authorization } = require('../../middlewares/authMiddlewares');

router.get('/getQuiz', authorization(), quizController.getQuiz);

router.post('/startQuiz', authorization(), quizController.startQuiz);

router.post('/submitQuiz', authorization(), quizController.submitQuiz);

router.get('/myQuiz', authorization(), quizController.myQuiz);

router.post('/quizWinners', authorization(), quizController.quizWinners);

router.post('/enroll', authorization(), quizController.enrollQuiz);

router.get(
  '/get-certificate/:userId',
  authorization(),
  quizController.getCertificate
);

module.exports = router;
