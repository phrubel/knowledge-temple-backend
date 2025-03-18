const mongoose = require('mongoose');

const StreamSchema = mongoose.Schema({
  title: String,
  playbackUrl: String,
  streamKey: String,
  isLive: { type: Boolean, default: false },
  upcomming: { type: Boolean, default: true },
  startDate: { type: Date },
  standard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'standard',
  }, // e.g., "10th Grade"
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'board',
    // required: "Board Required",
  },
});

const Stream = mongoose.model('Stream', StreamSchema);
module.exports = Stream;
