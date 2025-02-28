const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const board = Schema(
  {
    boardname: {
      type: String,
      required: "Board Name Required.",
    },
    boardshortname: {
      type: String,
      required: "Board short name Required",
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

module.exports = mongoose.model("board", board);
