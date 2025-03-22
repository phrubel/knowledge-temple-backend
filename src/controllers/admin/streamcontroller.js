const { ivs, cloudwatch, ivsChat } = require('../../config/awsConfig');
const Stream = require('../../models/streamModel');
const { APISuccess } = require('../../utils/responseHandler');

exports.createUpcomingLive = async (req, res) => {
  const { title, startDate } = req.body;

  try {
    // Create a new IVS channel
    const channelParams = {
      latencyMode: 'REALTIME', // ✅ Real-Time Streaming
      type: 'BASIC',
      name: title,
    };

    const { channel, streamKey } = await ivs
      .createChannel(channelParams)
      .promise();

    // Create an IVS Chat Room
    const chatParams = {
      name: `chat-${title}`,
    };
    const chatRoom = await ivsChat.createRoom(chatParams).promise();

    // Save stream and chat room details in MongoDB
    const newStream = new Stream({
      title,
      playbackUrl: channel.playbackUrl,
      ingestUrl: channel.ingestEndpoint,
      streamId: streamKey.value,
      chatRoomId: chatRoom.arn, // Save chat room ID
      channelArn: channel.arn, // Save channel ARN
      startDate,
    });

    await newStream.save();
    res.status(201).json(newStream);
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ message: 'Failed to create stream', error });
  }
};

exports.getAllUpcomingStream = async (req, res) => {
  try {
    const query = req.body;
    const result = await Stream.find({
      ...query,
      startDate: { $gte: new Date() },
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
        upcomming: false,
        isLive: true,
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
    await Stream.updateMany({}, { isLive: false, upcomming: false });
    return res.status(200).json(new APISuccess(200, 'Live session ended!'));
  } catch (error) {
    console.log('==========================', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.fetchStream = async (req, res) => {
  try {
    const stream = await Stream.findOne({
      isLive: true,
      upcomming: false,
    });
    if (!stream) return res.status(404).json({ message: 'No live session' });
    res.status(200).json({ message: 'Live session ', data: stream });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getViewers = async (req, res) => {
  const { channelArn } = req.body;

  const params = {
    Namespace: 'AWS/IVS',
    MetricName: 'ConcurrentViews',
    Dimensions: [{ Name: 'Channel', Value: channelArn }],
    StartTime: new Date(Date.now() - 10 * 60000), // 10 minutes ago
    EndTime: new Date(), // Current time
    Period: 60, // Fetch data for the last 1 minute
    Statistics: ['Maximum'],
  };

  try {
    const data = await cloudwatch.getMetricStatistics(params).promise();

    console.log('Viewer count data:', data);

    const viewerCount =
      data.Datapoints.length > 0 ? Math.round(data.Datapoints[0].Maximum) : 0;

    res.status(200).json({
      message: 'Fetch viewers count successfully',
      viewers: viewerCount,
    });
  } catch (error) {
    console.error('Error fetching viewer count:', error);
    res.status(500).json({ error: 'Failed to fetch viewer count' });
  }
};

exports.getChatToken = async (req, res) => {
  try {
    const { chatRoomArn, userId } = req.body; // Get from request

    if (!chatRoomArn || !userId) {
      return res
        .status(400)
        .json({ error: 'chatRoomArn and userId are required' });
    }

    const response = await ivsChat
      .createChatToken({
        roomIdentifier: chatRoomArn,
        userId: userId,
        capabilities: ['SEND_MESSAGE', 'DISCONNECT_USER'],
        sessionDurationInMinutes: 60, // Token valid for 1 hour
      })
      .promise();

    res.json({ token: response.token });
  } catch (error) {
    console.error('Error generating chat token:', error);
    res
      .status(500)
      .json({ error: 'Failed to generate chat token', details: error.message });
  }
};
