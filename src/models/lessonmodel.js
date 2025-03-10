const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Lesson = Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    }, // Reference to the Course model
    title: { type: String, required: true },
    description: { type: String, default: "" },

    materialType: {
      type: String,
      enum: ["pdf", "video", "none"],
      default: "none",
    },
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "standard",
    }, // e.g., "10th Grade"
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
    }, // e.g., "Mathematics"
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "board",
      // required: "Board Required",
    },
    materialUrl: { type: String, default: "" },
    isMaterial: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },

  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Lesson", Lesson);
