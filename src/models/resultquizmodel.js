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
        },
        selectedAnswer: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    }, // Total score
    startedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    certificate: {
      type: String, // Store a URL or certificate ID
      default: null, // Initially null, can be updated after quiz completion
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizResult", ResultSchema);
