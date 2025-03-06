const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = Schema(
  {
    name: {
      type: String,
      // required: "Name Required",
      default: '',
    },
    email: {
      type: String,
      // required: "Email Required",
      default: '',
    },
    mobile: {
      type: String,
      required: 'Mobile Number Required',
      unique: true,
    },
    password: {
      type: String,
      required: 'Password Required',
    },
    dob: {
      type: Date,
      // required: "Birth Date Required",
    },
    profileImg: {
      type: String,
      // required: "Profile image Required",
      default: '',
    },
    gender: {
      type: String,
      default: '',
      // enum: ["m", "f"],
    },
    stdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'standard',
      // required: "Standard Required",
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'board',
      // required: "Board Required",
    },
    subject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        // required: "Subject Name Required",
      },
    ],
    activity: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activity',
        // required: "Activity Name Required",
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    lang: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    userRole: {
      type: String,
      enum: ['user', 'admin', 'both'],
      default: 'user',
    },
    referralCode: {
      type: String,
      required: 'Referral Code Required.',
      unique: true,
    },
    balance: {
      type: Number,
      default: 0, // Initial wallet balance
      min: 0,
    },
    schoolName: {
      type: String,
      default: '',
    },
    learningGoal: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('user', user);
