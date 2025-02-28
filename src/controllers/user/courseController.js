"use strict";

const { APISuccess, APIError } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const COURSE = require("../../models/courseModel");
const Constants = require("../../constants/appConstants");
const Payment = require("../../models/payment");
const Offer = require("../../models/offerModel");
const User = require("../../models/userModel");
const { createOrder } = require("../../utils/paymentHandler");
const crypto = require("crypto");
const mongoose = require("mongoose");
const CourseTracking = require("../../models/courseTracking.model");

exports.getCourses = async function (req, res) {
  try {
    const { page, search, subjectId, standardId, type, courseId } = req.body;
    const { _id: userId } = req.user;

    if (type && type === "S" && !courseId) {
      throw new APIError(400, "Course Id is required for similar courses");
    }

    const limit = Constants.PAGE_SIZE;
    const skip = (page - 1) * limit;

    // Fetch user data
    const user = await User.findById(userId).populate("stdId").populate("subject");

    const query = { isActive: true, lessons: { $exists: true, $ne: [] } };

    if (subjectId && subjectId !== "") {
      query.subject = subjectId;
    }
    if (standardId && standardId !== "") {
      query.standard = standardId;
    }

    // recommended course
    if (type && type === "R") {
      if (user.stdId && user.stdId !== "") {
        query.$or = [
          { standard: user.stdId },
          ...query.$or || [],
        ];
      }
      if (user.subject && user.subject.length > 0) {
        query.$or = [
          { subject: { $in: user.subject } },
          ...query.$or || [],
        ];
      }
      if (user.learningGoal && user.learningGoal !== "") {
        query.$or = [
          { features: { $regex: user.learningGoal, $options: "i" } },
          ...query.$or || [],
        ];
      }
    }
    // similar courses
    if (type && type === "S") {
      const course = await COURSE.findById(courseId).lean();
      query._id = { $ne: courseId };
      if (course.standard && course.standard !== "") {
        query.$or = [
          { standard: course.standard },
          ...query.$or || [],
        ];
      }
      if (course.subject && course.subject !== "") {
        query.$or = [
          { subject: course.subject },
          ...query.$or || [],
        ];
      }
      if (course.skillLevel && course.skillLevel !== "") {
        query.$or = [
          { skillLevel: course.skillLevel },
          ...query.$or || [],
        ];
      }
    }
    // search course
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        ...query.$or || []];
    }

    let courses = await COURSE.find(query)
      .select("-lessons -isActive -createdAt -updatedAt -__v")
      .populate("subject", "subject")
      .populate("standard", "std")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalRecords = await COURSE.countDocuments(query); // Get the total count for pagination

    const purchedCourses = await Payment.find({
      userId,
      paymentStatus: Constants.SUCCESS,
      courseId: { $nin: [null] },
      // paymentId: { $nin: [null, ""] },
    })
      .select("courseId userId paymentStatus orderId")
      .lean();

    const offers = await Offer.find({ endAt: { $gt: Date.now() } })
      .select("-quizzes")
      .sort({ createdAt: -1 });

    courses = courses.map((course) => {
      const purched = purchedCourses.find(
        (pc) => pc.courseId.toString() == course._id.toString(),
      );
      const ofr = offers.find((ofr) => ofr.courses.includes(course._id));
      return {
        ...course,
        ...(purched && { payment: purched }),
        ...(ofr && { offers: ofr }),
      };
    });

    return res.status(200).json(
      new APISuccess(200, "Course fetch Successfully", {
        docs: courses,
        currentPage: page,
        totalPage: Math.ceil(totalRecords / limit),
      }),
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getCourseDetail = async function (req, res) {
  try {
    const { courseId } = req.body;
    const { _id: userId } = req.user;

    const course = await COURSE.findById(courseId)
      .select("-isActive -createdAt -updatedAt -__v")
      .populate("subject", "subject")
      .populate("standard", "std")
      .populate("lessons", "title description materialType materialUrl", {
        isActive: true,
        isMaterial: false,
      })
      .lean();

    const trackedCourse = await CourseTracking.find({ userId, courseId });
    trackedCourse.forEach((tracking) => {
      const index = course.lessons.findIndex((lesson) => lesson._id.toString() === tracking.lessonId.toString());
      if (index > -1) {
        course.lessons[index].progress = tracking.status;
      }
    });

    const purchedCourses = await Payment.findOne({
      userId,
      courseId,
      paymentStatus: Constants.SUCCESS,
      // courseId: { $nin: [null] },
      // paymentId: { $nin: [null, ""] },
    })
      .select("courseId userId paymentStatus orderId")
      .sort({ createdAt: -1 })
      .lean();

    const offers = await Offer.findOne({
      endAt: { $gt: Date.now() },
      courses: { $in: [new mongoose.Types.ObjectId(courseId)] },
    })
      .select("-quizzes")
      .sort({ createdAt: -1 });

    if (!course) {
      throw new APIError(404, "Course not found");
    }

    const purchasedUsers = await Payment.find({ courseId, paymentStatus: Constants.SUCCESS })
      .select("userId")
      .populate("userId", "name mobile image")
      .limit(10)
      .lean();

    course.enrolledStudents = purchasedUsers || [];

    return res.status(200).json(
      new APISuccess(200, "Course fetch Successfully", {
        ...course,
        ...(offers && { offer: offers }),
        ...(purchedCourses && { payment: purchedCourses }),
      }),
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.enrollCourse = async function (req, res) {
  try {
    const { _id: userId } = req.user;
    const { courseId, offerId, referCode } = req.body;

    const course = await COURSE.findOne({
      _id: courseId,
      isActive: true,
    }).select("price");

    if (!course) {
      throw new APIError(404, "Course not found");
    }

    let ofrPer = 0;
    if (offerId) {
      const offer = await Offer.findById(offerId);
      const now = Date.now();
      if (offer && offer.startAt < now && offer.endAt > now) {
        ofrPer = offer.offrPer;
      }
    }

    const user = User.findById(userId).lean();

    const coursePayment = await Payment.findOne({
      courseId,
      userId,
      paymentStatus: Constants.SUCCESS,
    });

    if (coursePayment) {
      throw new APIError(400, "Course already enrolled");
    }

    let finalPrice =
      course.price > 0
        ? ofrPer > 0
          ? course.price - (course.price * ofrPer) / 100
          : course.price
        : course.price;

    let pointsBalance = 0;
    if (user.balance > 0 && finalPrice > 0) {
      if (finalPrice > user.balance) {
        finalPrice -= user.balance;
        pointsBalance = 0;
      } else {
        pointsBalance = user.balance - finalPrice;
        finalPrice = 0;
      }
    }

    if (finalPrice > 0) {
      const receiptId = "receipt_" + crypto.randomBytes(4).toString("hex");
      const order = await createOrder(
        finalPrice,
        Constants.CURRENCY,
        receiptId,
      );

      if (!order) {
        throw new APIError(400, "Order not Created.");
      }

      await Payment.create({
        courseId,
        userId,
        receiptId,
        orderId: order.id,
        amount: order.amount,
        paymentStatus: Constants.CREATE,
        referCode: referCode || "",
        pointsBalance: pointsBalance,
      });

      return res.status(200).json(
        new APISuccess(200, "Course Enrolled Successfully", {
          url: `${Constants.BASE_URL}/checkout?receiptId=${receiptId}`,
        }),
      );
    } else {
      await Payment.create({
        courseId,
        userId,
        paymentStatus: Constants.SUCCESS,
        amount: finalPrice,
        tranResp: Constants.SUCCESS,
      });

      const payment = await Payment.findOne({
        userId,
        courseId,
        paymentStatus: Constants.SUCCESS,
      })
        .select("-createdAt -updatedAt -tranResp")
        .lean();

      return res
        .status(200)
        .json(new APISuccess(200, "Course Enrolled Successfully", payment));
    }
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getCourseProgress = async function (req, res) {
  try {
    const { page } = req.query;
    const { _id: userId } = req.user;
    const pageNo = parseInt(page) || 1;
    const skip = (pageNo - 1) * Constants.PAGE_SIZE;

    const result = await CourseTracking.find({ userId })
      .select("-__v -createdAt -updatedAt -userId")
      .skip(skip)
      .populate("courseId", "title")
      .limit(Constants.PAGE_SIZE);

    const totalRec = await CourseTracking.countDocuments({ userId });

    return res.status(200).json(new APISuccess(200, "Courses Tracked", {
      docs: result,
      total: Math.ceil(totalRec / Constants.PAGE_SIZE),
      currentPage: pageNo,
    }));

  } catch (error) {
    return handleError(res, error);
  }
};
