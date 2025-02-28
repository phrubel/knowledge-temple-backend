const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpModel = Schema(
  {
    otp: {
      type: String,
      required: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
    otpType: {
      type: String,
      required: true,
    },
    isVerified: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("otp", otpModel);
