const Stream = require('../models/streamModel');

exports.deleteStream = async () => {
  try {
    await Stream.deleteMany({ startDate: { $lt: new Date() } });
  } catch (error) {
    console.log('==========================', error);
  }
};
