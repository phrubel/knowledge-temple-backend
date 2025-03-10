// ivsService.js
const AWS = require('aws-sdk');

// Configure AWS credentials and region
AWS.config.update({
  accessKeyId: 'AKIARWPFIXZJGLY4YUHL',
  secretAccessKey: 'omBqG5FHPb/OoXZ3rj9zFzoh/a4k9lK/y44V4Upz',
  region: 'Asia Pacific(Mumbai)', // Change to your preferred region
});

// Create an IVS client
const ivs = new AWS.IVS();

// Create a new channel
async function createChannel(name, type = 'STANDARD') {
  const params = {
    name,
    type,
  };

  try {
    const response = await ivs.createChannel(params).promise();
    return response;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
}

// Get stream info
async function getStreamByChannel(channelArn) {
  const params = {
    channelArn,
  };

  try {
    const response = await ivs.getStream(params).promise();
    return response.stream;
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      return {
        status: 'OFFLINE',
        message: 'No active stream for this channel',
      };
    }
    throw error;
  }
}

// Function to get a specific stream by channel ARN
async function getStream(channelArn) {
  const params = {
    channelArn,
  };

  try {
    const response = await ivs.getStream(params).promise();
    console.log('Stream details:', response.stream);
    return response.stream;
  } catch (error) {
    // If the stream is not active, this will throw an error
    console.error('Error getting stream (possibly not active):', error);
    throw error;
  }
}

// Function to stop a stream
async function stopStream(channelArn) {
  const params = {
    channelArn,
  };

  try {
    const response = await ivs.stopStream(params).promise();
    console.log('Stream stopped successfully');
    return response;
  } catch (error) {
    console.error('Error stopping stream:', error);
    throw error;
  }
}

// List all active streams
async function listAllStreams(options = {}) {
  const params = {
    filterByHealth: options.filterByHealth || undefined,
    maxResults: options.maxResults || 50,
    nextToken: options.nextToken || undefined,
  };

  try {
    const response = await ivs.listStreams(params).promise();
    return {
      streams: response.streams,
      nextToken: response.nextToken,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createChannel,
  getStreamByChannel,
  listAllStreams,
  getStream,
  stopStream,
};
