'use strict';

const bcrypt = require('bcryptjs');
const { generateToken } = require('../authController');
const {
  generateOTP,
  isValidMobileNumber,
  handleError,
} = require('../../utils/utility');
const { APIError, APISuccess } = require('../../utils/responseHandler');
const OTP = require('../../models/otpModel');
const USER = require('../../models/userModel');
const FCMTOKEN = require('../../models/fcmtokenModel');
const Constants = require('../../constants/appConstants');
const QuizResult = require('../../models/resultquizmodel');
const { sendSMS } = require('../../utils/smsHandler');
const mongoose = require('mongoose');
const User = require('../../models/userModel');

exports.getProfile = async function (req, res) {
  try {
    const userId = req.user._id; // Assuming userId is available in req.user

    // Mark the account as deleted
    const user = await USER.findById(userId)
      .select('-password -__v -createdAt -updatedAt -isDeleted')
      .populate('stdId', 'std')
      .populate('boardId', 'boardname boardshortname')
      .populate('subject', 'subject')
      .populate('activity', 'activityname')
      .lean();

    if (!user) {
      throw APIError(400, 'User Not Found');
    }

    const profileCompletion = getProfileCompletion(user);

    const [highestResult, lowestResult] = await Promise.all([
      QuizResult.findOne()
        .select('score')
        .sort({ score: -1 })
        .populate({
          path: 'quizId',
          select: 'title description standard subject ageGroup',
          populate: [
            { path: 'subject', select: 'subject' },
            { path: 'standard', select: 'std' },
          ],
        }),
      QuizResult.findOne()
        .select('score')
        .sort({ score: 1 })
        .populate({
          path: 'quizId',
          select: 'title description standard subject ageGroup',
          populate: [
            { path: 'subject', select: 'subject' },
            { path: 'standard', select: 'std' },
          ],
        }),
    ]);

    return res.status(200).json(
      new APISuccess(200, 'Profile Fetched.', {
        ...user,
        profileCompletion: profileCompletion,
        highestResult,
        lowestResult,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getOTP = async function (req, res) {
  const { mobile } = req.body;

  try {
    // Validate mobile number
    if (!isValidMobileNumber(mobile)) {
      throw new APIError(400, 'Invalid mobile number format.');
    }

    // isAlready Has User
    const user = await USER.findOne({ mobile });

    if (user) {
      throw new APIError(400, 'User Already Registered. Please Sign In!');
    }

    // Fetch OTP from database
    const otpRecord = await OTP.findOne({ mobile }).sort({
      createdAt: -1,
    });

    // Check OTP expiration
    if (otpRecord && new Date() < otpRecord.expiredAt) {
      // Send success response
      return res
        .status(200)
        .json(new APISuccess(200, 'OTP generated successfully.', {}));
    } else {
      // Generate OTP and expiration time
      const otp = Constants.FAST_API_ENABLE == 1 ? generateOTP() : '123456';
      const expiredAt = new Date(
        Date.now() + Constants.OTP_EXPIRED_TIME * 60 * 1000
      ); // OTP valid for 10 minutes

      if (Constants.FAST_API_ENABLE == 1) {
        await sendSMS(mobile, otp);
      }

      // Save OTP to database
      await OTP.create({ mobile, otp, expiredAt, otpType: 'signUp' });

      // Send success response
      return res
        .status(200)
        .json(new APISuccess(200, 'OTP generated successfully.', {}));
    }
  } catch (error) {
    return handleError(res, error);
  }
};

exports.forgotPassword = async function (req, res) {
  const { mobile } = req.body;

  try {
    const user = await USER.findOne({ mobile }).lean();

    if (!user) {
      throw new APIError(400, 'Account Not Found.');
    }

    if (user.isBlocked) {
      throw new APIError(400, 'Your Account was blocked.');
    }

    if (!user.password) {
      throw new APIError(400, 'Please Create Password First.');
    }

    // Fetch OTP from database
    const otpRecord = await OTP.findOne({ mobile }).sort({
      createdAt: -1,
    });

    // Check OTP expiration
    if (otpRecord && new Date() < otpRecord.expiredAt) {
      return res
        .status(200)
        .json(new APISuccess(200, 'OTP generated successfully.', {}));
    }

    // Generate OTP and expiration time
    const otp = Constants.FAST_API_ENABLE == 1 ? generateOTP() : '123456';
    const expiredAt = new Date(
      Date.now() + Constants.OTP_EXPIRED_TIME * 60 * 1000
    ); // OTP valid for 10 minutes

    if (Constants.FAST_API_ENABLE == 1) {
      await sendSMS(mobile, otp);
    }

    // Save OTP to database
    await OTP.create({ mobile, otp, expiredAt, otpType: 'forgotPassword' });

    return res
      .status(200)
      .json(new APISuccess(200, 'OTP generated successfully.', {}));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.verifyOTP = async function (req, res) {
  const { mobile, otp } = req.body;

  try {
    // Validate mobile number
    if (!isValidMobileNumber(mobile)) {
      throw new APIError(400, 'Invalid mobile number');
    }

    // Validate OTP length
    if (!otp || otp.length !== 6) {
      throw new APIError(400, 'Invalid OTP format');
    }

    // Fetch OTP from database
    const otpRecord = await OTP.findOne({ mobile, otp })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!otpRecord) {
      throw new APIError(400, 'Invalid OTP or mobile number.');
    }

    // Check OTP expiration
    if (new Date() > otpRecord.expiredAt) {
      await OTP.deleteMany({ mobile });
      throw new APIError(400, 'OTP has expired. Please request a new one.');
    }

    // now delete all OTP records for this mobile
    await OTP.findOneAndUpdate({ mobile, otp }, { isVerified: true });

    // OTP verified successfully
    return res.status(200).json(
      new APISuccess(200, 'OTP verified successfully.', {
        verifyId: otpRecord._id,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createPassword = async function (req, res) {
  const { mobile, password, verifyId, fcmToken } = req.body;

  const xLocalization = req.xLocalization;

  try {
    // Step 1: Validate input
    if (!mobile || !password) {
      throw new APIError(400, 'Mobile number and password are required.');
    }

    if (!verifyId) {
      throw new APIError(400, 'Verify ID is required.');
    }

    // Step 2: Validate password constraints
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new APIError(
        400,
        'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.'
      );
    }

    // check user verified or not
    const user = await USER.findOne({ mobile }).lean();
    const otpRecord = await OTP.findById(verifyId).lean();

    if (
      !otpRecord ||
      ((!user || !user.isVerified) && otpRecord.otpType !== 'signUp')
    ) {
      throw new APIError(400, 'Please Do Register or Login.');
    }

    if (!otpRecord || !otpRecord.isVerified) {
      throw new APIError(400, 'Invalid Verification.');
    }

    // Step 3: Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let updatedUser;
    if (!user) {
      const referralCode = `KT${Math.floor(
        100000 + Math.random() * 900000
      ).toString()}`;
      await USER.create({
        mobile: mobile,
        password: hashedPassword,
        isVerified: true,
        lang: xLocalization,
        userRole: 'user',
        referralCode: referralCode,
      });
      updatedUser = await USER.findOne({ mobile })
        .select('-password -__v -createdAt -updatedAt -isDeleted')
        .lean();
    } else {
      updatedUser = await USER.findOneAndUpdate(
        { mobile },
        { password: hashedPassword },
        {
          new: true,
          projection: {
            mobile: 1,
            isVerified: 1,
            name: 1,
            email: 1,
            stdId: 1,
            boardId: 1,
            subject: 1,
            activity: 1,
            lang: 1,
          },
        }
      ).lean();
    }

    // Step 5: Generate accessToken and refreshToken
    const tokens = generateToken(updatedUser);

    await OTP.deleteMany({ mobile });

    if (fcmToken) {
      storeUserToken(updatedUser._id, req.deviceType, fcmToken);
    }

    const profileCompletion = getProfileCompletion(updatedUser);

    // Step 6: Return response with tokens
    return res.status(200).json(
      new APISuccess(200, 'Password Created Successfully.', {
        ...tokens,
        ...updatedUser,
        profileCompletion: profileCompletion,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.signIn = async function (req, res) {
  const { mobile, password, fcmToken } = req.body;

  const xLocalization = req.xLocalization;

  try {
    const user = await USER.findOne(
      { mobile },
      {
        password: 1,
        mobile: 1,
        isVerified: 1,
        name: 1,
        email: 1,
        stdId: 1,
        boardId: 1,
        subject: 1,
        activity: 1,
        lang: 1,
      }
    ).lean();

    if (!user) {
      throw new APIError(400, 'Account Not Found.');
    }

    if (!user.isVerified) {
      throw new APIError(400, 'Please Sign Up First.');
    }

    if (user.isBlocked) {
      throw new APIError(400, 'Your Account was blocked.');
    }

    if (!user.password) {
      return res
        .status(400)
        .json(
          new APIError(
            400,
            'Please Create Password First.',
            'createPassword',
            {}
          ).toJson()
        );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new APIError(400, 'Mobile Number or Password Not Match.');
    }

    const currentDate = new Date();
    await USER.findOneAndUpdate(
      { mobile },
      { isActive: true, lastLoginAt: currentDate, lang: xLocalization }
    );

    delete user.password;

    const tokens = generateToken(user);

    if (fcmToken) {
      storeUserToken(user._id, req.deviceType, fcmToken);
    }

    const profileCompletion = getProfileCompletion(user);

    return res.status(200).json(
      new APISuccess(200, 'Sign In Successfully.', {
        ...tokens,
        ...user,
        profileCompletion: profileCompletion,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateProfile = async function (req, res) {
  try {
    const userId = req.user._id; // Assuming user ID is sent in the request parameters
    const updateData = req.body; // Data to update the user profile
    const xLocalization = req.xLocalization;

    const user = await USER.findById(userId);

    if (
      (req.user.userRole !== 'user' && updateData.email) ||
      updateData.userRole
    ) {
      throw new APIError(400, 'User not allowed to update profile.');
    }

    if (user.dob && updateData.dob) {
      throw new APIError(400, "Date of Birth can't be updated.");
    }

    // Update user profile
    const updatedUser = await USER.findByIdAndUpdate(
      userId,
      { ...updateData, lang: xLocalization },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validators are applied
        projection: {
          mobile: 1,
          name: 1,
          email: 1,
          stdId: 1,
          boardId: 1,
          subject: 1,
          activity: 1,
          lang: 1,
          dob: 1,
          schoolName: 1,
          learningGoal: 1,
          gender: 1,
        },
      }
    )
      .populate('stdId', 'std')
      .populate('boardId', 'boardname boardshortname')
      .populate('subject', 'subject')
      .populate('activity', 'activityname')
      .lean();

    const profileCompletion = getProfileCompletion(updatedUser);

    // Response data
    return res.status(200).json(
      new APISuccess(200, 'User profile updated successfully', {
        ...updatedUser,
        profileCompletion: profileCompletion,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteAccount = async function (req, res) {
  try {
    const userId = req.user._id; // Assuming userId is available in req.user

    // Mark the account as deleted
    const deletedUser = await USER.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    if (!deletedUser) {
      throw new APIError(400, 'User not Found');
    }

    return res
      .status(200)
      .json(APISuccess(200, 'Account deleted successfully', {}));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.logout = async function (req, res) {
  try {
    const userId = req.user._id;

    // Find the FCM token associated with the user
    const existingToken = await FCMTOKEN.findOne({ userId });

    if (existingToken) {
      // Mark the token as inactive
      existingToken.fcmToken = '';
      existingToken.isActive = false;
      await existingToken.save();
    }

    return res.status(200).json(new APISuccess(200, 'Logout Successfully', {}));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.changePassword = async function (req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await USER.findById(userId);
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new APIError(400, 'Old Password Not Match.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await USER.findByIdAndUpdate(userId, { password: hashedPassword });
    return res
      .status(200)
      .json(new APISuccess(200, 'Password Changed Successfully', {}));
  } catch (error) {
    return handleError(res, error);
  }
};

async function storeUserToken(userId, deviceType, fcmToken) {
  try {
    const existingToken = await FCMTOKEN.findById(userId);

    if (existingToken) {
      // Update the existing token
      existingToken.fcmToken = fcmToken;
      existingToken.deviceType = deviceType || existingToken.deviceType;
      existingToken.isActive = true; // Ensure it's marked as active
      await existingToken.save();
    } else {
      // Create a new token
      const newToken = new FCMTOKEN({
        userId,
        fcmToken,
        deviceType,
      });
      await newToken.save();
    }
  } catch (error) {
    console.log(error);
  }
}

function getProfileCompletion(user) {
  // Calculate profile completion steps
  let profileCompletion = 0;

  if (user.name) profileCompletion++;
  if (user.email) profileCompletion++;
  if (user.dob) profileCompletion++;
  if (user.stdId && user.boardId) profileCompletion++;
  if (user.subject.length > 0 || user.activity.length > 0) profileCompletion++;

  return profileCompletion;
}

exports.convertPoints = async function (req, res) {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id);

    if (user.points < 100) {
      throw new APIError(400, 'Insufficient points');
    }

    await User.findByIdAndUpdate(
      _id,
      { $inc: { balance: user.points }, points: 0 },
      { new: true }
    );

    return res
      .status(200)
      .json(new APISuccess(200, 'User points converted successfully'));
  } catch (error) {
    return handleError(res, error);
  }
};
