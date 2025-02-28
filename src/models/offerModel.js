const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offersSchema = Schema(
  {
    title: {
      type: String,
      required: "Offer Title Required.",
    },
    description: {
      type: String,
      required: "Offer Description Required.",
    },
    image: {
      type: String,
      required: "Offer Image Required.",
    },
    offrPer: {
      type: Number,
      required: "Offer Percentage Required.",
    },
    startAt: {
      type: Date,
      required: "Offer Start Date Required.",
    },
    endAt: {
      type: Date,
      required: "Offer End Date Required.",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("offers", offersSchema);
