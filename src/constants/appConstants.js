const appConstants = {
  PORT: process.env.PORT,
  DATABASE: process.env.DATABASE,
  KEY_CER: process.env.KEY_CER,
  CERT: process.env.CERT,
  ACCESS_TOKEN_EXPIRED: process.env.ACCESS_TOKEN_EXPIRED,
  REFRESH_TOKEN_EXPIRED: process.env.REFRESH_TOKEN_EXPIRED,
  TOKEN_SECRET_KEY: process.env.TOKEN_SECRET_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_SECRET_ID: process.env.RAZORPAY_SECRET_ID,
  FAST2SMSAPI: process.env.FAST2SMS_API_KEY,
  FAST_API_ENABLE: process.env.FAST_API_ENABLE,
  OTP_EXPIRED_TIME: 10,
  PAGE_SIZE: 10,
  CURRENCY: 'INR',
  CREATE: 'Create',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  EARN_POINTS: 5,
  BASE_URL: process.env.BASE_URL,
};

module.exports = appConstants;
