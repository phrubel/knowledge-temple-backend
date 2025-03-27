const { Quiz, Question } = require("../../models/quizmodel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");
const QuizResult = require("../../models/resultquizmodel");
const { sendPush } = require("../../utils/pushNotificationHandler");
const sea = require("node:sea");
const ResultQuiz = require("../../models/resultquizmodel");

// Create new quiz
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      standard,
      subject,
      questions,
      startDate,
      endDate,
      price,
      duration,
      ageGroup,
      bonusPercent,
    } = req.body;

    // Validate required fields
    const isValidSSA = !standard && !subject && !ageGroup;
    if (
      !title ||
      !description ||
      isValidSSA ||
      !questions ||
      !questions.length > 0 ||
      !startDate ||
      !endDate
    ) {
      throw new APIError(400, "All fields are required");
    }

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      standard,
      startDate,
      endDate,
      price,
      duration,
      ageGroup,
      bonusPercent,
    });

    const nowDate = new Date().toISOString();
    if (startDate > endDate) {
      throw new APIError(400, "Start date must be before end date");
    } else if (startDate < nowDate || endDate < nowDate) {
      throw new APIError(400, "Please Select a valid start and end date");
    }

    const quesIds = (await Question.insertMany(questions)).map(
      (question) => question._id
    );

    const quizQue = await Quiz.findByIdAndUpdate(
      quiz._id,
      {
        questions: quesIds,
      },
      {
        new: true,
        projection: { questions: 0 },
      }
    );

    sendPush(
      "New Quiz Created.",
      `A new quiz titled "${title}" has been created. Check it out!`
    );

    return res
      .status(200)
      .json(new APISuccess(200, "Quiz created successfully", quizQue));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const { page, search } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limit = Constants.PAGE_SIZE;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const quizzes = await Quiz.find(query)
      .sort({ endDate: -1, createdAt: -1 })
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    const totalReco = await Quiz.countDocuments(query);
    const totalPages = Math.ceil(totalReco / limit);

    return res.status(200).json(
      new APISuccess(200, "Get all quizzes successfully", {
        docs: quizzes,
        currentPage: pageNumber,
        totalPages: totalPages,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");

    if (!quiz) {
      throw new APIError(404, "Quiz not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Get quiz by ID successfully", quiz));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      standard,
      subject,
      questions,
      startDate,
      endDate,
      price,
      duration,
      ageGroup,
      bonusPercent,
    } = req.body;

    // Validate required fields
    const isValidSSA = !standard && !subject && !ageGroup;
    if (
      !title ||
      !description ||
      isValidSSA ||
      !questions ||
      !questions.length > 0 ||
      !startDate ||
      !endDate
    ) {
      throw new APIError(400, "All fields are required");
    }

    const nowDate = new Date().toISOString();
    if (startDate > endDate) {
      throw new APIError(400, "Start date must be before end date");
    } else if (startDate < nowDate || endDate < nowDate) {
      throw new APIError(400, "Please Select a valid start and end date");
    }

    const temp = await Quiz.findById(req.params.id);

    if (!temp) {
      throw new APIError(400, "Quiz Not Found.");
    }
    // check quiz if not started
    if (temp.startDate <= nowDate) {
      throw new APIError(400, "Cannot update quiz that has already started");
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        subject,
        standard,
        startDate,
        endDate,
        price,
        duration,
        ageGroup,
        bonusPercent,
      },
      { new: true }
    );

    if (!quiz) {
      throw new APIError(404, "Quiz not found");
    }

    if (questions.length > 0) {
      if (quiz.questions.length > 0) {
        await Question.deleteMany({ _id: { $in: quiz.questions } });
      }

      const quesIds = (await Question.insertMany(questions)).map(
        (question) => question._id
      );

      quiz.questions = quesIds;
      await quiz.save();
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Quiz updated successfully", quiz));
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete quiz
const toggleActiveQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { returnDocument: "after" }
    );

    if (!quiz) {
      throw new APIError(404, "Quiz not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Quiz status successfully", quiz));
  } catch (error) {
    return handleError(res, error);
  }
};

const quizResults = async (req, res) => {
  try {
    const { quizId, page } = req.body;
    const pageNo = parseInt(page) || 1;
    const skip = (pageNo - 1) * Constants.PAGE_SIZE;

    const quizResults = await QuizResult.find({ quizId })
      .sort({ score: -1, submittedTime: 1 })
      .select("-answers -quizId")
      .populate("userId", "name mobile")
      .skip(skip)
      .limit(Constants.PAGE_SIZE)
      .lean();

    const totalDocuments = await QuizResult.countDocuments({ quizId });

    quizResults.forEach((result) => {
      if (result.submittedAt && result.startedAt) {
        result.timeTaken =
          new Date(result.submittedAt) - new Date(result.startedAt);
      } else {
        result.timeTaken = 0;
      }
    });

    quizResults.sort((a, b) => a.timeTaken - b.timeTaken);

    return res.status(200).json(
      new APISuccess(200, "Top User of Quiz Result.", {
        docs: quizResults,
        currentPage: pageNo,
        totalPages: Math.ceil(totalDocuments / Constants.PAGE_SIZE),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all active quizzes and which is not started yet.
const getEligibleOfrQuizzes = async (req, res) => {
  try {
    const { search } = req.body;
    const limit = 30;

    const nowDate = Date.now();
    const query = {
      isActive: true,
      startDate: { $gt: nowDate },
      price: { $gt: 0 },
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const quizzes = await Quiz.find(query).select("title").limit(limit);

    return res.status(200).json(
      new APISuccess(200, "Get all quizzes successfully", {
        quizzes,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const getUserQuizResults = async (req, res) => {
  try {
    const { userId, page } = req.body;
    const pageNo = parseInt(page) || 1;
    const skip = (pageNo - 1) * Constants.PAGE_SIZE;

    let results = await ResultQuiz.find({ userId }) // Find quiz results by quizId
      .select("-answers")
      .populate({
        path: "quizId", // Populate quiz details
        select: "title", // Fetch only the title of the quiz
        populate: {
          path: "questions",
          select: "_id",
        },
      })
      // .populate({
      //   path: "answers.questionId", // Populate question details for each answer
      //   model: "Question",
      //   select: "question options", // Fetch only required fields
      // })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Constants.PAGE_SIZE)
      .lean();

    results = results.map((result) => {
      const { quizId, ...rest } = result;
      return {
        ...rest,
        quizId: {
          _id: quizId._id,
          title: quizId.title,
        },
        totalQuestions: quizId?.questions?.length || 0, // Count total questions
      };
    });

    const totalDocs = await ResultQuiz.countDocuments({ userId });

    return res.status(200).json(
      new APISuccess(200, "Quiz Results", {
        docs: results,
        currentPage: pageNo,
        totalPages: Math.ceil(totalDocs / Constants.PAGE_SIZE),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
const getQuizLeaderboard = async (req, res) => {
  try {
    let results = await ResultQuiz.find({})
      .select("-answers") // Find quiz results by quizId
      .populate({
        path: "quizId", // Populate quiz details
        select: "title", // Fetch only the title of the quiz
        populate: {
          path: "questions",
          select: "_id",
        },
      })
      .populate({
        path: "userId", // Populate user details
        select: "name email mobile", // Fetch user name & email
      })
      .sort({ createdAt: -1 })

      .lean();

    return res.status(200).json(
      new APISuccess(200, "Quiz Results", {
        docs: results,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
const updateQuizLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const fileUrl = req.file?.path; // ?. dile jodi undefined hoy, taile error dibe na

    console.log("Received ID:", id);
    console.log("Uploaded File URL:", fileUrl);

    if (!id || !fileUrl) {
      return res.status(400).json({ success: false, message: "Invalid Data" });
    }

    const result = await QuizResult.findByIdAndUpdate(
      id,
      { certificate: fileUrl },
      { new: true }
    );

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "No record found for this ID" });
    }

    res.json({ success: true, message: "Certificate uploaded", data: result });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed", error });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  toggleActiveQuiz,
  quizResults,
  getEligibleOfrQuizzes,
  getUserQuizResults,
  getQuizLeaderboard,
  updateQuizLeaderboard,
};
