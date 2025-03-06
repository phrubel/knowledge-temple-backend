'use strict';

const { APIError, APISuccess } = require('../../utils/responseHandler');
const { handleError } = require('../../utils/utility');
const User = require('../../models/userModel');
const { Quiz } = require('../../models/quizmodel');
const Constants = require('../../constants/appConstants');
const ResultQuiz = require('../../models/resultquizmodel');
const Payment = require('../../models/payment');
const Offer = require('../../models/offerModel');
const { calculateAge, fisherYatesShuffle } = require('../../utils/utility');
const { createOrder } = require('../../utils/paymentHandler');
const crypto = require('crypto');
const Transection = require('../../models/transactionModel');

exports.getQuiz = async function (req, res) {
  try {
    const { page } = req.query;
    const pageNo = parseInt(page) || 1;
    const pageLimit = Constants.PAGE_SIZE;

    const nowDate = new Date().toISOString();

    let quizzes = await Quiz.find({
      isActive: true,
      //   startDate: { $gte: nowDate },
      endDate: { $gt: nowDate },
    })
      .select('-__v -createdAt -updatedAt')
      .populate('standard', 'std')
      .populate('subject', 'subject')
      .sort({ createdAt: -1 })
      .skip((pageNo - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    // Add total questions count for each quiz
    quizzes = quizzes.map((quiz) => {
      const totalQue = quiz.questions.length;
      const { questions, ...rest } = quiz;
      return {
        ...rest,
        totalQuestions: totalQue,
      };
    });

    // remove already submitted quizzes
    const { _id: userId } = req.user;
    const userQuizzes = await ResultQuiz.find({ userId }).lean();
    const quizIds = userQuizzes.map((quiz) => quiz.quizId.toString());
    quizzes = quizzes.filter((quiz) => !quizIds.includes(quiz._id.toString()));

    // Get the total number of documents
    const totalDocs = await Quiz.countDocuments({
      isActive: true,
      //   startDate: { $gte: nowDate },
      endDate: { $gt: nowDate },
    });
    const totalPages = Math.ceil(totalDocs / pageLimit);

    const purchedQuiz = await Payment.find({
      userId,
      paymentStatus: Constants.SUCCESS,
      quizId: { $nin: [null] },
      paymentId: { $nin: [null, ''] },
    })
      .select('quizId userId paymentStatus orderId')
      .lean();

    const offers = await Offer.find({ endAt: { $gt: Date.now() } })
      .select('-courses')
      .sort({ createdAt: -1 });

    quizzes = quizzes.map((quiz) => {
      const purched = purchedQuiz.find(
        (pc) => pc.quizId.toString() == quiz._id.toString()
      );
      const ofr = offers.find((ofr) => ofr.quizzes.includes(quiz._id));
      return {
        ...quiz,
        ...(purched && { payment: purched }),
        ...(ofr && { offers: ofr }),
      };
    });

    return res.status(200).json(
      new APISuccess(200, 'Get all quizzes successfully', {
        docs: quizzes,
        totalRecords: totalDocs,
        totalPage: totalPages,
        currentPage: pageNo,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.enrollQuiz = async function (req, res) {
  try {
    const { quizId, offerId, referCode } = req.body;
    const { _id: userId } = req.user;

    const quiz = await Quiz.findOne({ _id: quizId, isActive: true }, 'price');

    if (!quiz) {
      throw new APIError(404, 'Quiz Not Found');
    }

    const payment = await Payment.findOne({
      quizId,
      userId,
      paymentStatus: Constants.SUCCESS,
    });

    const user = await User.findById(userId).lean();

    if (payment) {
      throw new APIError(400, 'Quiz Already Enrolled.');
    }

    let ofrPer = 0;
    if (offerId) {
      const offer = await Offer.findById(offerId);
      const now = Date.now();
      if (offer && offer.startAt < now && offer.endAt > now) {
        ofrPer = offer.offrPer;
      }
    }

    //course final price
    let finalPrice =
      quiz.price > 0
        ? ofrPer > 0
          ? quiz.price - (quiz.price * ofrPer) / 100
          : quiz.price
        : quiz.price;

    //wallet balance
    let walletBalance = 0;

    if (user.balance > 0 && finalPrice > 0) {
      if (finalPrice <= user.balance) {
        walletBalance = user.balance - finalPrice;
        finalPrice = 0;
      }
    }

    if (finalPrice > 0) {
      const receiptId = 'receipt_' + crypto.randomBytes(4).toString('hex');
      const order = await createOrder(
        finalPrice,
        Constants.CURRENCY,
        receiptId
      );

      if (!order) {
        throw new APIError(400, 'Order not Created.');
      }

      await Payment.create({
        paymentFor: 'enroll',
        quizId,
        userId,
        receiptId,
        orderId: order.id,
        amount: order.amount,
        paymentStatus: Constants.CREATE,
        referCode: referCode || '',
      });

      return res.status(200).json(
        new APISuccess(200, 'Quiz Enrolled Successfully', {
          url: `${Constants.BASE_URL}/checkout?receiptId=${receiptId}`,
        })
      );
    } else {
      const newPayment = await Payment.create({
        paymentFor: 'enroll',
        quizId,
        userId,
        paymentStatus: Constants.SUCCESS,
        amount: finalPrice,
        tranResp: Constants.SUCCESS,
        referCode: referCode || '',
      });

      await User.findByIdAndUpdate(payment.userId, {
        balance: walletBalance,
      });

      await Transection.create({
        transactionType: 'debit',
        amount: user.balance - walletBalance,
        paymentId: newPayment._id,
      });

      if (referCode) {
        const referUser = await User.findOneAndUpdate(
          { referralCode: newPayment.referCode },
          { $inc: { balance: 10 } },
          { new: true }
        );
        await Transection.create({
          transactionType: 'credit',
          amount: 10,
          paymentId: newPayment._id,
          referredBy: referUser._id.toString(),
          referredTo: newPayment.userId,
        });
      }

      const payment = await Payment.findOne({
        userId,
        quizId,
        paymentStatus: Constants.SUCCESS,
      })
        .select('-createdAt -updatedAt -tranResp')
        .lean();

      return res
        .status(200)
        .json(new APISuccess(200, 'Quiz Enrolled Successfully', payment));
    }
  } catch (error) {
    return handleError(res, error);
  }
};

exports.startQuiz = async function (req, res) {
  try {
    const { quizId } = req.body;
    const { _id: userId } = req.user;

    const quiz = await Quiz.findById(quizId)
      .populate('questions', '-__v -createdAt -updatedAt')
      .lean();

    const user = await User.findById(userId);
    const userQuiz = await ResultQuiz.findOne({ userId, quizId });

    if (!quiz || !quiz.isActive) {
      throw new APIError(404, 'Quiz not found');
    }

    if (!user) {
      throw new APIError(404, 'User not found');
    }

    if (!user.dob || !user.stdId || !user.boardId || !user.subject.length) {
      throw new APIError(
        400,
        'Please complete your profile to start the quiz.'
      );
    }

    if (quiz.startDate > new Date().toISOString()) {
      throw new APIError(400, 'Quiz has not started yet.');
    }

    if (quiz.endDate < new Date().toISOString()) {
      throw new APIError(400, 'Quiz has already ended.');
    }

    if (userQuiz) {
      throw new APIError(400, 'You have already attempted this quiz.');
    }

    if (quiz.ageGroup && quiz.ageGroup.length > 0) {
      const age = calculateAge(user.dob, new Date().toISOString());
      const ageGroup = quiz.ageGroup.split(',');
      if (ageGroup.length == 1) {
        const minAge = ageGroup[0];
        if (minAge > age) {
          throw new APIError(400, 'You are not eligible to attempt this quiz.');
        }
      }
      if (ageGroup.length == 2) {
        const minAge = ageGroup[0];
        const maxAge = ageGroup[1];
        if (minAge > age || maxAge < age) {
          throw new APIError(400, 'You are not eligible to attempt this quiz.');
        }
      }
    }

    if (quiz.price > 0) {
      const payment = await Payment.findOne({
        quizId,
        userId,
        paymentStatus: Constants.SUCCESS,
        paymentId: { $nin: [null, ''] },
      });

      if (!payment) {
        throw new APIError(
          400,
          'Quiz not enrolled. Please Enroll Quiz and start Again.'
        );
      }
    }

    const result = new ResultQuiz({
      userId,
      quizId,
      answers: [],
      score: 0,
      startedAt: new Date().toISOString(),
    });
    await result.save();

    quiz.questions = fisherYatesShuffle(quiz.questions);

    quiz.questions.forEach((question) => {
      question.options.forEach((option) => {
        delete option.isCorrect;
      });
    });

    return res
      .status(200)
      .json(new APISuccess(200, 'Quiz started successfully', quiz));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.submitQuiz = async function (req, res) {
  try {
    const { quizId, answers } = req.body;
    const { _id: userId } = req.user;

    const quiz = await Quiz.findById(quizId)
      .populate('questions', '-__v -createdAt -updatedAt')
      .lean();
    const userQuiz = await ResultQuiz.findOne({ userId, quizId });

    // Validate required fields
    if (!userId || !answers || answers.length == 0) {
      throw new APIError(400, 'Answers are required');
    }

    if (!quiz || !quiz.isActive) {
      throw new APIError(404, 'Quiz not found');
    }

    if (!userQuiz) {
      throw new APIError(400, 'You have not started this quiz yet.');
    }

    if (quiz.endDate < new Date().toISOString()) {
      throw new APIError(400, 'Quiz has already ended.');
    }

    if (userQuiz.submittedAt) {
      throw new APIError(400, 'You have already submitted this quiz.');
    }

    const now = new Date();
    if (quiz.duration > 0) {
      const startTime = new Date(userQuiz.startedAt);
      // different between now and start time in minutes
      const diff = (now - startTime) / 60000;
      if (diff > quiz.duration) {
        throw new APIError(400, "Time's up! Quiz submission is closed.");
      }
    }

    let score = 0;
    const resultAnswers = answers.map((answer) => {
      const question = quiz.questions.filter(
        (question) => question._id == answer.questionId
      )[0];
      if (!question) {
        throw new APIError(400, 'Invalid question ID');
      }

      const isCorrect = question.options.find(
        (option) => option.isCorrect && option._id == answer.selectedAnswer
      );

      if (isCorrect) {
        score += 1;
      } else {
        score -= 0.25;
      }

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: isCorrect ? true : false,
      };
    });

    userQuiz.answers = resultAnswers;
    userQuiz.score = score;
    userQuiz.submittedAt = now.toISOString();
    const quizResult = await userQuiz.save();

    let results = await ResultQuiz.findById(userQuiz._id) // Find quiz results by quizId
      .populate({
        path: 'quizId', // Populate quiz details
        select: 'title', // Fetch only the title of the quiz
      })
      .populate({
        path: 'answers.questionId', // Populate question details for each answer
        model: 'Question',
        select: 'question options', // Fetch only required fields
      })
      .lean();

    return res
      .status(200)
      .json(new APISuccess(200, 'Quiz submitted successfully', results));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.myQuiz = async function (req, res) {
  try {
    const { _id: userId } = req.user;
    const { page } = req.query;
    const pageNo = parseInt(page) || 1;
    const pageLimit = Constants.PAGE_SIZE;

    let results = await ResultQuiz.find({ userId }) // Find quiz results by quizId
      .populate({
        path: 'quizId', // Populate quiz details
        select: 'title', // Fetch only the title of the quiz
      })
      .populate({
        path: 'answers.questionId', // Populate question details for each answer
        model: 'Question',
        select: 'question options', // Fetch only required fields
      })
      .sort({ createdAt: -1 })
      .skip((pageNo - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    results = results.map((result) => ({
      _id: result._id,
      userId: result.userId,
      quizId: result.quizId._id,
      quizTitle: result.quizId.title,
      score: result.score,
      answers: result.answers.map((answer) => ({
        _id: answer.questionId._id,
        question: answer.questionId.question,
        options: answer.questionId.options,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
      })),
    }));

    const totalDocs = await ResultQuiz.countDocuments({ userId });

    return res.status(200).json(
      new APISuccess(200, 'Get my quizzes successfully', {
        docs: results,
        currentPage: pageNo,
        totalPage: Math.ceil(totalDocs / pageLimit),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.quizWinners = async function (req, res) {
  try {
    const { quizId, page } = req.body;
    const { _id: userId } = req.user;
    const pageLimit = Constants.PAGE_SIZE;

    const userQuiz = await ResultQuiz.findOne({ userId, quizId });

    if (!userQuiz) {
      throw new APIError(400, 'You have not attempted this quiz yet.');
    }

    // Check if the quiz has ended and announce winners if applicable
    const topResults = await ResultQuiz.find({ quizId })
      .populate('userId', 'name')
      .sort({ score: -1, submittedAt: 1 })
      .skip((page - 1) * pageLimit)
      .limit(pageLimit);

    const totalDocs = await ResultQuiz.countDocuments({ quizId });

    // Announce winners
    const winners = topResults.map((result, index) => ({
      userId: result.userId,
      name: result.name,
      score: result.score,
      rank: (page - 1) * pageLimit + (index + 1),
    }));

    return res.status(200).json(
      new APISuccess(200, 'Quiz winner getting successfully', {
        docs: winners,
        currentPage: page,
        totalPage: Math.ceil(totalDocs / pageLimit),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
