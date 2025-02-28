// Import Mongoose
const mongoose = require("mongoose");

// Define the Option Schema for questions
const OptionSchema = new mongoose.Schema({
  option: { type: String, required: true }, // Text of the option
  isCorrect: { type: Boolean, default: false }, // Indicates if the option is correct
});

// Define the Question Schema
const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true }, // Question text
    options: { type: [OptionSchema], required: true }, // List of options
  },
  {
    timestamps: true,
  }
);

// Define the Quiz Schema
const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Quiz title
    description: { type: String }, // Description of the quiz
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "standard",
    }, // e.g., "10th Grade"
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
    }, // e.g., "Mathematics"
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question", default: [] },
    ], // Array of questions
    startDate: { type: Date, required: true }, // Quiz start date
    endDate: { type: Date, required: true }, // Quiz end date
    price: { type: Number, default: 0 }, // Price of the quiz if paid
    duration: { type: Number, default: 0 }, // Duration of the quiz in minutes
    ageGroup: { type: String }, // Age group for the quiz
    isActive: { type: Boolean, default: true }, // Indicates if the quiz is active
  },
  {
    timestamps: true,
  }
);

// Add an index for efficient querying based on startDate and endDate
QuizSchema.index({ startDate: 1, endDate: 1 });

// Export the models
module.exports = {
  Question: mongoose.model("Question", QuestionSchema),
  Quiz: mongoose.model("Quiz", QuizSchema),
};
