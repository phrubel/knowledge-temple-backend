const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subject = Schema(
  {
    subject: {
      type: String,
      required: "subject Name Required.",
    },
    standard: {
      type: Schema.Types.ObjectId,
      ref: "standard",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("subject", subject);
