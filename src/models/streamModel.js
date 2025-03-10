const mongoose = require('mongoose');

const StreamSchema = mongoose.Schema({
  title: String,
  playbackUrl: String,
  streamKey: String,
  isLive: { type: Boolean, default: false },
});

const Stream = mongoose.model('Stream', StreamSchema);
module.exports = Stream;
