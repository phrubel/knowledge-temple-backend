const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fcmTokenSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Reference to the User model
      required: true,
    },
    fcmToken: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      enum: ["android", "ios"], // Optional field to specify device type
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true, // Indicates if the token is currently active
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` timestamps
  }
);

module.exports = mongoose.model("fcmToken", fcmTokenSchema);
