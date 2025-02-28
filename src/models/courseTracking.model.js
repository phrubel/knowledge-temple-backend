const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseTrackingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
    status: {
      type: String,
      enum: ["started", "in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("courseTracking", courseTrackingSchema);
