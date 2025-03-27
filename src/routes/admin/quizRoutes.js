const express = require("express");
const router = express.Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const {
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
} = require("../../controllers/admin/quizcontroller");
const upload = require("../../utils/certificateUpload");

// Route to create a new quiz
router.post("/create", authorization(true), createQuiz);

// Route to get all quizzes
router.get("/all", authorization(true), getAllQuizzes);
router.get("/quiz-leader-board", authorization(true), getQuizLeaderboard);
router.post(
  "/certificate/:id",
  upload.single("certificate"),
  authorization(true),
  updateQuizLeaderboard
);

// Route to get a quiz by ID
router.get("/:id", authorization(true), getQuizById);

// Route to update a quiz
router.put("/:id", authorization(true), updateQuiz);

// Route to active toggle a quiz
router.post("/activeToggle", authorization(true), toggleActiveQuiz);

router.post("/results", authorization(true), quizResults);

router.post(
  "/getEligibleOfrQuizzes",
  authorization(true),
  getEligibleOfrQuizzes
);

router.post("/getUserQuizResults", authorization(true), getUserQuizResults);

module.exports = router;
