const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Course = Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 }, // 0 for free courses
    rating: { type: Number, default: 0 }, // Average rating
    reviewsCount: { type: Number, default: 0 }, // Total number of reviews
    duration: { type: String, required: true }, // e.g., "2 months"
    features: [{ type: String }], // Array of features
    thumbnail: { type: String, required: true }, // URL of the course thumbnail
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'standard',
    }, // e.g., "10th Grade"
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subject',
    }, // e.g., "Mathematics"
    skillLevel: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    }, // e.g., "Beginner"
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        default: [],
      },
    ], // Reference to the Lesson model
    isActive: { type: Boolean, default: true }, // Active or inactive course
    bonusPercent: { type: Number, default: 0 }, // Indicates if the quiz is active
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Course', Course);
