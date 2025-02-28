const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const payment = Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      //   required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Create", "Success", "Failed"],
      required: true,
    },
    receiptId: {
      type: String,
    }, // Payment receipt ID
    orderId: {
      type: String,
    },
    paymentId: {
      type: String,
    }, // Payment transaction ID
    paymentDate: {
      type: Date,
      default: Date.now(),
    }, // Payment timestamp
    amount: {
      type: Number,
      required: true,
    },
    pointsBalance: {
      type: Number,
      default: 0,
    },
    tranResp: {
      type: String,
      //   required: true,
    },
    referCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("payment", payment);
