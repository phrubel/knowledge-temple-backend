'use strict';

const Razorpay = require('razorpay');
const Constants = require('../constants/appConstants');

const razorpay = new Razorpay({
  key_id: Constants.RAZORPAY_KEY_ID,
  key_secret: Constants.RAZORPAY_SECRET_ID,
});

exports.createOrder = async function (amount, currency, receipt) {
  const options = {
    amount: amount * 100, // Convert amount to paise
    currency,
    receipt,
  };

  const order = await razorpay.orders.create(options);

  return order;
};
