const { APISuccess, APIError } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constant = require("../../constants/appConstants");
const Payment = require("../../models/payment");
const User = require("../../models/userModel");

exports.getPaymentsAll = async (req, res) => {
  try {
    const { page, search, userId } = req.query;
    const pageNo = parseInt(page) || 1;
    const limit = Constant.PAGE_SIZE;
    const skip = (pageNo - 1) * limit;

    let mUserId = "";
    if (userId) {
      mUserId = userId;
    } else {
      if (search) {
        const user = await User.findOne({ mobile: search });
        if (user) {
          mUserId = user._id;
        }
      }
    }
    const query = {};
    if (userId) {
      query.userId = mUserId;
    }

    const payments = await Payment.find(query)
      .populate("courseId", "title")
      .populate("quizId", "title")
      .populate("userId", "mobile name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPayments = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalPayments / limit);

    return res.status(200).json(
      new APISuccess(200, "Fetched All Payments.", {
        docs: payments,
        currentPage: pageNo,
        totalPages,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
