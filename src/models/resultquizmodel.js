const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }, // User ID
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    }, // Quiz ID
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz.Question",
          // required: true,
        },
        selectedAnswer: {
          type: String,
          // required: true,
        },
        isCorrect: {
          type: Boolean,
          // required: true,
        },
      },
    ],
    score: {
      type: Number,
      // required: true,
      default: 0,
    }, // Total score
    startedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizResult", ResultSchema);
