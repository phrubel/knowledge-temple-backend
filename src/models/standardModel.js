const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const standard = Schema(
  {
    std: {
      type: String,
      required: "Standard Name Required.",
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

module.exports = mongoose.model("standard", standard);
