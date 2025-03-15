const Stream = require('../../models/streamModel');
const AWS = require('aws-sdk');
const { APISuccess, APIError } = require('../../utils/responseHandler');
const { handleError } = require('../../utils/utility');

// AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1', // Change to your IVS region
});

const cloudwatch = new AWS.CloudWatch({ region: 'ap-south-1' });

exports.createUpcomingLive = async (req, res) => {
  try {
    const { title, startDate } = req.body;

    if (!title || !startDate) {
      throw new APIError(400, 'All fields are required');
    }

    const newStream = new Stream({
      title,
      playbackUrl:
        'https://6b879004354a.ap-south-1.playback.live-video.net/api/video/v1/ap-south-1.116981808722.channel.bFpcIjcN1i86.m3u8',
      streamKey: 'sk_ap-south-1_4LeRY8OAJOep_ZX2Eci4lRcTxA8SND1PngxjmaeNKSY',
      isLive: false,
      upcomming: true,
      startDate,
    });

    const data = await newStream.save();

    return res
      .status(200)
      .json(new APISuccess(200, 'Live created successfully', data));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getAllUpcomingStream = async (req, res) => {
  try {
    const result = await Stream.find({
      upcomming: true,
    }).sort('startDate -1');
    return res
      .status(200)
      .json(new APISuccess(200, 'Upcoming live fetched successfully', result));
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.startStream = async (req, res) => {
  try {
    const { id } = req.params;
    const upcomingLive = await Stream.findById(id);

    // Combine startDate and startTime to create a full date object
    const startDateTime = new Date(upcomingLive.startDate);

    // Get the current date and time in UTC
    const currentDate = new Date();

    // Check if the start date and time have already passed
    if (startDateTime <= currentDate) {
      return res
        .status(400)
        .json({ error: 'The live stream start time is in the past.' });
    }

    const live = await Stream.findByIdAndUpdate(
      id,
      {
        isLive: true,
        upcomming: false,
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new APISuccess(200, 'Live session started!', live));
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//stop stream route
exports.stopStream = async (req, res) => {
  try {
    await Stream.updateMany({}, { isLive: false });
    return res.status(200).json(new APISuccess(200, 'Live session ended!'));
  } catch (error) {
    console.log('==========================', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.fetchStream = async (req, res) => {
  try {
    const stream = await Stream.findOne({ isLive: true });
    if (!stream) return res.status(404).json({ message: 'No live session' });
    res.status(200).json({ message: 'Live session ', data: stream });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.fetchUpcomingLive = async (req, res) => {
  try {
    const live = await Stream.findOne({ upcomming: true });
    if (!live) return res.status(404).json({ message: 'No live session' });
    res.status(200).json({ message: 'Live session ', data: live });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getViewers = async (req, res) => {
  const channelArn = 'arn:aws:ivs:ap-south-1:116981808722:channel/bFpcIjcN1i86'; // Replace with your IVS Channel ARN

  const params = {
    MetricName: 'ConcurrentViews',
    Namespace: 'AWS/IVS',
    Dimensions: [{ Name: 'channel', Value: channelArn }],
    StartTime: new Date(Date.now() - 5 * 60 * 1000),
    EndTime: new Date(),
    Period: 60, // 1-minute intervals
    Statistics: ['Sum'], // "Sum" gives the best real-time count
  };

  try {
    const data = await cloudwatch.getMetricStatistics(params).promise();

    const viewerCount =
      data.Datapoints.length > 0 ? Math.round(data.Datapoints[0].Sum) : 0;

    res.status(200).json({
      message: 'Fetch viewers count successfully',
      viewers: viewerCount,
    });
  } catch (error) {
    console.error('Error fetching viewer count:', error);
    res.status(500).json({ error: 'Failed to fetch viewer count' });
  }
};
