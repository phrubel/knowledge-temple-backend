const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const User = require("../../models/userModel");
const Constant = require("../../constants/appConstants");
const Payment = require("../../models/payment");
const QuizResult = require("../../models/resultquizmodel");

exports.getUsersListing = async (req, res) => {
  try {
    const { page, search } = req.query;
    const pageNo = parseInt(page) || 1;
    const limit = Constant.PAGE_SIZE;
    const skip = (pageNo - 1) * limit;

    const query = {};
    if (search) {
      query.mobile = { $regex: search, $options: "i" };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(new APISuccess(200, "Users retrieved successfully", {
      docs: users, totalPages, currentPage: pageNo,
    }));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(userId, [{ $set: { isBlocked: { $not: "$isBlocked" } } }], {
      returnDocument: "after",
    });

    if (!user) {
      throw new APIError(404, "User not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, `User is ${user.isBlocked ? "Blocked." : "Unblocked."}.`, user));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const { mobile, balance, dob } = req.body;

    const updateData = {};
    if (balance !== undefined) updateData.balance = balance;
    if (dob !== undefined) updateData.dob = dob;

    const user = await User.findOneAndUpdate({ mobile }, updateData, {
      new: true, projection: {
        password: 0,
      },
    });

    if (!user) {
      throw new APIError(404, "User not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "User details updated successfully", user));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId)
      .select("-password")
      .populate("stdId", "std")
      .populate("boardId", "boardname boardshortname")
      .populate("subject", "subject")
      .populate("activity", "activityname")
      .lean();

    if (!user) {
      throw new APIError(404, "User not found");
    }

    user.totalCourses = await Payment.countDocuments({
      userId: user._id,
      paymentStatus: Constant.SUCCESS,
      courseId: { $ne: null },
    });
    user.completedQuizzes = await QuizResult.countDocuments({ submittedAt: { $ne: null }, userId: user._id });

    return res.status(200).json(new APISuccess(200, "User details fetched successfully", user));
  } catch (error) {
    return handleError(res, error);
  }
};
