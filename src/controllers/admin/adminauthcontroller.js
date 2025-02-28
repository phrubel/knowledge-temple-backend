const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const { generateToken } = require("../authController");
const User = require("../../models/userModel");
const { Quiz } = require("../../models/quizmodel");
const Payment = require("../../models/payment");
const Constant = require("../../constants/appConstants");
const bcrypt = require("bcryptjs");

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new APIError(400, "Email and password are required");
    }

    const user = await User.findOne({
      email: email,
      $or: [{ userRole: { $eq: "both" } }, { userRole: { $eq: "admin" } }],
    })
      .select("email password userRole name mobile profileImg")
      .lean();

    if (!user) {
      throw new APIError(404, "Admin not found");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new APIError(400, "Invalid password");
    }

    delete user.password;

    const token = generateToken(user);

    return res.status(200).json(
      new APISuccess(200, "Admin logged in successfully", {
        ...token,
        ...user,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const user = await User.findById(userId)
      .select("email userRole name mobile profileImg")
      .lean();

    if (!user) {
      throw new APIError(404, "User not found");
    }

    const totalUser = await User.countDocuments();

    const currentDate = new Date();
    const activeQuiz = await Quiz.countDocuments({
      isActive: true,
      startDate: { $lte: currentDate }, // startDate is less than or equal to the current date
      endDate: { $gte: currentDate }, // endDate is greater than or equal to the current date
    });

    const totalPaymentSum = await Payment.aggregate([
      {
        $match: {
          paymentId: { $nin: [null, ""] },
          paymentStatus: Constant.SUCCESS,
        },
      },
      {
        $group: {
          _id: null, // Grouping by a dummy value since we just want the total sum
          totalSum: { $sum: "$amount" }, // Summing up the `totalPayment` field
        },
      },
    ]);
    const totalSum = totalPaymentSum[0]?.totalSum || 0;

    return res.status(200).json(
      new APISuccess(200, "User profile fetched successfully", {
        ...user,
        totalSum,
        activeQuiz,
        totalUser,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
