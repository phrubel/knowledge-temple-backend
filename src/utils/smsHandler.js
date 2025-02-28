"use strict";

const appConstants = require("../constants/appConstants");

exports.sendSMS = async (phone, otp) => {
  const response = await fetch(
    `https://www.fast2sms.com/dev/bulkV2?authorization=${appConstants.FAST2SMSAPI}&variables_values=${otp}&route=otp&numbers=${phone}`
  );
  const data = await response.json();
  console.log(data);
};
