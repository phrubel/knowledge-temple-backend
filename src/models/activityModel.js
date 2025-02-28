const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activity = Schema(
  {
    activityname: {
      type: String,
      required: "Activity Name Required.",
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

module.exports = mongoose.model("activity", activity);
