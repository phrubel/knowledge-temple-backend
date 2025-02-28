const mongoose = require("mongoose");

// Define the Mentor Schema
const MentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      // trim: true,
      // lowercase: true,
    },
    mobile: {
      type: String,
      unique: true,
    },
    expertise: {
      type: [String], // Array of strings to represent multiple areas of expertise
      required: true,
    },
    experienceYears: {
      type: Number, // Number of years of experience
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt timestamps

// Export the model
const Mentor = mongoose.model("Mentor", MentorSchema);

module.exports = Mentor;
