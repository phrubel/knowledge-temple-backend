const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  playbackUrl: { type: String, required: true },
  ingestUrl: { type: String, required: true },
  streamId: { type: String, required: true },
  chatRoomId: { type: String, required: true },
  channelArn: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  upcomming: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
});

const Stream = mongoose.model('Stream', StreamSchema);
module.exports = Stream;
