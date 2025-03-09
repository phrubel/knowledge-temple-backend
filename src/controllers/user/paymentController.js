const { APISuccess, APIError } = require('../../utils/responseHandler');
const { handleError } = require('../../utils/utility');
const Constants = require('../../constants/appConstants');
const Payment = require('../../models/payment');
const Transaction = require('../../models/transactionModel');
const User = require('../../models/userModel');
const {
  validateWebhookSignature,
} = require('razorpay/dist/utils/razorpay-utils');
const { createOrder } = require('../../utils/paymentHandler');
const crypto = require('crypto');
const { Quiz } = require('../../models/quizmodel');

exports.checkout = async (req, res) => {
  try {
    const { receiptId } = req.body;

    const createdPayout = await Payment.findOne({ receiptId })
      .populate('courseId', 'title')
      .populate('quizId', 'title')
      .populate('userId', 'name email mobile')
      .lean();

    if (!createdPayout) {
      throw new APIError(400, 'Pay slip not found.');
    }

    let description;
    if (createdPayout.courseId) {
      description = createdPayout.courseId.title;
    }
    if (createdPayout.quizId) {
      description = createdPayout.quizId.title;
    }

    const data = {
      key: Constants.RAZORPAY_KEY_ID,
      orderId: createdPayout.orderId,
      amount: createdPayout.amount,
      currency: 'INR',
      receipt: receiptId,
      description: description,
      paymentFor: createdPayout?.paymentFor,
      name: createdPayout?.userId?.name,
      email: createdPayout?.userId?.email,
      contact: createdPayout?.userId?.mobile,
    };

    return res
      .status(200)
      .json(new APISuccess(200, 'Checkout Details Fetched.', data));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.verifyPayout = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const secret = Constants.RAZORPAY_SECRET_ID;
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(
      body,
      razorpay_signature,
      secret
    );
    if (isValidSignature) {
      // Update the order with payment details
      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id, paymentStatus: Constants.SUCCESS },
        { new: true }
      ).lean();

      const quiz = await Quiz.findOne(
        { _id: payment.quizId, isActive: true },
        'price bonusPercent'
      );
      const course = await Quiz.findOne(
        { _id: payment.courseId, isActive: true },
        'price bonusPercent'
      );

      //handle deposit amount
      if (payment.paymentFor === 'deposit') {
        await User.findByIdAndUpdate(payment.userId, {
          $inc: { balance: payment.amount },
        });
        await Transaction.create({
          transactionType: 'D',
          amount: payment.amount,
          paymentId: payment._id,
        });
        return res.status(200).json({ status: 'ok' });
      }

      if (payment.paymentFor === 'enroll') {
        if (payment.referCode) {
          let points = 0;

          if (quiz) {
            points = (quiz.price * quiz.bonusPercent) / 100;
          }
          if (course) {
            points = (course.price * course.bonusPercent) / 100;
          }
          if (points) {
            const referUser = await User.findOneAndUpdate(
              { referralCode: payment.referCode },
              { $inc: { points: points } },
              { new: true }
            );
            await Transaction.create({
              transactionType: 'C',
              points: points,
              paymentId: payment._id,
              referredBy: referUser._id.toString(),
              referredTo: payment.userId,
            });
          }
        }
        return res.status(200).json({ status: 'ok' });
      }
    } else {
      if (razorpay_order_id && razorpay_payment_id) {
        await Payment.findOneAndUpdate(
          { orderId: razorpay_order_id },
          { paymentId: razorpay_payment_id, paymentStatus: Constants.FAILED }
        );
      }
      return res.status(400).json({
        status: 'verification_failed',
        message: 'Payment verification failed.',
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 'error', message: 'Error verifying payment' });
  }
};

exports.deposit = async function (req, res) {
  try {
    const { userId, amount } = req.body;

    const receiptId = 'receipt_' + crypto.randomBytes(4).toString('hex');
    const order = await createOrder(amount, Constants.CURRENCY, receiptId);

    if (!order) {
      throw new APIError(400, 'Order not Created.');
    }

    await Payment.create({
      userId,
      receiptId,
      orderId: order.id,
      amount: order.amount,
      paymentStatus: Constants.CREATE,
      paymentFor: 'deposit',
    });

    return res.status(200).json(
      new APISuccess(200, 'Deposit Successfully', {
        url: `${Constants.BASE_URL}/checkout?receiptId=${receiptId}`,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.withdrawAmount = async (req, res) => {
  const {
    userId,
    amount,
    accountType,
    accountHolderName,
    accountNumber,
    ifscCode,
    vpa,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError(404, 'User not found');
    }
    if (user.balance < amount) {
      throw new APIError(400, 'Insufficient balance');
    }

    // Create Fund Account (Without Saving to DB)
    let fundAccountData;
    if (accountType === 'bank_account') {
      fundAccountData = {
        contact_id: userId,
        account_type: 'bank_account',
        bank_account: {
          name: accountHolderName,
          account_number: accountNumber,
          ifsc: ifscCode,
        },
      };
    } else if (accountType === 'vpa') {
      fundAccountData = {
        contact_id: userId,
        account_type: 'vpa',
        vpa: {
          address: vpa,
        },
      };
    } else {
      throw new APIError(400, 'Invalid account type');
    }

    // Call Razorpay API to create a fund account
    const fundAccountResponse = await axios.post(
      'https://api.razorpay.com/v1/fund_accounts',
      fundAccountData,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    const fundAccountId = fundAccountResponse.data.id;

    // Initiate Payout
    const payoutData = {
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: fundAccountId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      mode: accountType === 'vpa' ? 'upi' : 'imps',
      purpose: 'payout',
      queue_if_low_balance: true,
      narration: 'Wallet Withdrawal',
    };

    const payoutResponse = await axios.post(
      'https://api.razorpay.com/v1/payouts',
      payoutData,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    // Deduct balance from user
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -amount },
    });

    await Transaction.create({
      transactionType: 'withdraw',
      points: amount, // total balance
    });

    return res
      .status(200)
      .json(
        new APISuccess(200, 'Withdraw amount successfully', payoutResponse.data)
      );
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ status: 'error', message: 'Error withdraw amount' });
  }
};

// get transaction history
exports.getTransaction = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId and optional transaction type from query params

    if (!userId) {
      return res
        .status(400)
        .json({ status: 'error', message: 'User ID is required' });
    }

    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json(new APISuccess(200, 'transactions get successfully', transactions));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 'error', message: 'Error fetching transactions' });
  }
};
