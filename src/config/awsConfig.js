const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1', // Change to your IVS region
});

const ivs = new AWS.IVS();
const cloudwatch = new AWS.CloudWatch({ region: 'ap-south-1' });
const ivsChat = new AWS.Ivschat();

module.exports = { ivs, cloudwatch, ivsChat };
