"use strict";

const { APISuccess, APIError } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Course = require("../../models/courseModel");
const Lesson = require("../../models/lessonmodel");
const Payment = require("../../models/payment");
const Constants = require("../../constants/appConstants");

exports.getMaterial = async function (req, res) {
  try {
    const { page, search, subjectId, standardId, type } = req.body;
    const { _id: userId } = req.user;

    const limit = Constants.PAGE_SIZE;
    const skip = (page - 1) * limit;

    const perchedCourse = await Payment.find({
      userId,
      $and: [{ courseId: { $ne: null } }],
      paymentStatus: Constants.SUCCESS,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (perchedCourse.length === 0) {
      return res.status(200).json(
        new APISuccess(200, "Material fetch Successfully", {
          docs: perchedCourse,
          currentPage: page,
          totalPage: 0,
        }),
      );
    }

    const perchedCourseIds = perchedCourse.map((payment) =>
      payment.courseId.toString(),
    );

    const query = { isActive: true };

    if (subjectId && subjectId !== "") {
      query.subject = subjectId;
    }
    if (standardId && standardId !== "") {
      query.standard = standardId;
    }
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "") {
      query.materialType = type;
    }
    if (perchedCourseIds.length > 0) {
      query.courseId = { $in: perchedCourseIds };
    }

    if (type && type !== "" && (type === "V" || type === "P")) {
      // "pdf", "video", "none"
      query.materialType =
        type === "V" ? "video" : type === "P" ? "pdf" : "none";
    }

    query.$or = [
      { materialType: { $ne: "none" } },
      { materialUrl: { $ne: "" } },
      { isMaterial: true },
      ...(query.$or || []),
    ];

    const lessons = await Lesson.find(query)
      .populate("courseId", "title description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalRecords = await Lesson.countDocuments(query);
    return res.status(200).json(
      new APISuccess(200, "Material fetch Successfully", {
        docs: lessons,
        currentPage: page,
        totalPage: Math.ceil(totalRecords / limit),
      }),
    );
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getMaterialDetails = async function (req, res) {
  try {
    const { courseId } = req.body;
    const { _id: userId } = req.user;

    const payment = await Payment.findOne({
      userId,
      courseId,
      paymentStatus: Constants.SUCCESS,
    }).populate("courseId", "title description");

    if (!payment) {
      throw new APIError(
        400,
        "Please purchase a course after that you will access material.",
      );
    }

    const material = await Lesson.find({
      courseId: courseId,
      isActive: true,
      $or: [
        { materialType: { $ne: "none" } },
        { materialUrl: { $ne: "" } },
        { isMaterial: true },
      ],
    })
      .select("title materialType materialUrl")
      .populate("courseId", "title description");

    return res
      .status(200)
      .json(new APISuccess(200, "Material fetch Successfully", material));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getCoursesMaterial = async (req, res) => {
  try {
    const { page, search, subjectId, standardId } = req.body;
    const { _id: userId } = req.user;

    const limit = Constants.PAGE_SIZE;
    const skip = (page - 1) * limit;

    const perchedCourse = await Payment.find({
      userId,
      $and: [{ courseId: { $ne: null } }],
      paymentStatus: Constants.SUCCESS,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (perchedCourse.length === 0) {
      return res.status(200).json(
        new APISuccess(200, "Material fetch Successfully", {
          docs: perchedCourse,
          currentPage: page,
          totalPage: 0,
        }),
      );
    }

    const purchedCourseIds = perchedCourse.map((payment) =>
      payment.courseId.toString(),
    );

    const query = { isActive: true };

    if (subjectId && subjectId !== "") {
      query.subject = subjectId;
    }
    if (standardId && standardId !== "") {
      query.standard = standardId;
    }
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (purchedCourseIds.length > 0) {
      query._id = { $in: purchedCourseIds };
    }

    const courses = await Course.find(query)
      .select("-lessons -isActive -createdAt -updatedAt -__v")
      .populate("subject", "subject")
      .populate("standard", "std")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalRecords = await Course.countDocuments(query); // Get the total count for pagination

    return res.status(200).json(
      new APISuccess(200, "Material fetch Successfully", {
        docs: courses,
        currentPage: page,
        totalPage: Math.ceil(totalRecords / limit),
      }),
    );
  } catch (error) {
    return handleError(res, error);
  }
};
