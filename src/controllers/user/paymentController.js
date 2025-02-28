const { APISuccess, APIError } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");
const Payment = require("../../models/payment");
const Transaction = require("../../models/transactionModel");
const User = require("../../models/userModel");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

exports.checkout = async (req, res) => {
  try {
    const { receiptId } = req.body;

    const createdPayout = await Payment.findOne({ receiptId })
      .populate("courseId", "title")
      .populate("quizId", "title")
      .populate("userId", "name email mobile")
      .lean();

    if (!createdPayout) {
      throw new APIError(400, "Pay slip not found.");
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
      currency: "INR",
      receipt: receiptId,
      description: description,
      name: createdPayout.userId.name,
      email: createdPayout.userId.email,
      contact: createdPayout.userId.mobile,
    };

    return res
      .status(200)
      .json(new APISuccess(200, "Checkout Details Fetched.", data));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.verifyPayout = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const secret = Constants.RAZORPAY_SECRET_ID;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

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
      if (payment.pointsBalance > 0) {
        const referUser = await User.findByIdAndUpdate(
          payment.userId,
          { balance: payment.pointsBalance },
          { new: true }
        );
        await Transaction.create({
          transactionType: "D",
          points: payment.pointsBalance, // total balance
          paymentId: payment._id,
          referredBy: referUser._id.toString(),
          referredTo: payment.userId,
        });
      }
      if (payment.referCode) {
        const referUser = await User.findOneAndUpdate(
          { referralCode: payment.referCode },
          { $inc: { balance: Constants.EARN_POINTS } },
          { new: true }
        );
        await Transaction.create({
          transactionType: "C",
          points: Constants.EARN_POINTS,
          paymentId: payment._id,
          referredBy: referUser._id.toString(),
          referredTo: payment.userId,
        });
      }
      return res.status(200).json({ status: "ok" });
    } else {
      if (razorpay_order_id && razorpay_payment_id) {
        await Payment.findOneAndUpdate(
          { orderId: razorpay_order_id },
          { paymentId: razorpay_payment_id, paymentStatus: Constants.FAILED }
        );
      }
      return res.status(400).json({
        status: "verification_failed",
        message: "Payment verification failed.",
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error verifying payment" });
  }
};
