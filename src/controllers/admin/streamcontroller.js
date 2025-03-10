const Stream = require('../../models/streamModel');

exports.startStream = async (req, res) => {
  const { title, playbackUrl, streamKey } = req.body;
  const newStream = new Stream({ title, playbackUrl, streamKey, isLive: true });
  await newStream.save();
  res.json({ message: 'Live session started!', playbackUrl });
};

exports.stopStream = async (req, res) => {
  await Stream.updateMany({}, { isLive: false });
  res.json({ message: 'Live session ended!' });
};

exports.fetchStream = async (req, res) => {
  const stream = await Stream.findOne({ isLive: true });
  if (!stream) return res.status(404).json({ message: 'No live session' });
  res.json(stream);
};
