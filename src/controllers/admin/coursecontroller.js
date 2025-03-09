const Course = require("../../models/courseModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");

// Create new course
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      features,
      duration,
      skillLevel,
      thumbnail,
      price,
      subject,
      standard,
      boardId,
      bookPDF, // Optional
    } = req.body;
    console.log(req.body);
    // Validate required fields
    if (
      !title ||
      !description ||
      !thumbnail ||
      (!subject && !standard) ||
      !price ||
      !skillLevel ||
      !duration ||
      !features ||
      !boardId ||
      features.length === 0
    ) {
      throw new APIError(400, "All fields are required");
    }

    // Create course with optional bookPDF
    const courseData = {
      title,
      description,
      features,
      duration,
      skillLevel,
      thumbnail,
      price,
      subject,
      standard,
      boardId,
    };

    if (bookPDF) {
      courseData.bookPDF = bookPDF; // Add bookPDF only if provided
    }

    const course = await Course.create(courseData);

    const newCourse = await Course.findById(course._id)
      .populate("subject", "-__v -createdAt -updatedAt")
      .populate("standard", "-__v -createdAt -updatedAt")
      .populate("boardId", "boardname boardshortname")
      .lean();

    return res
      .status(200)
      .json(new APISuccess(200, "Course created successfully", newCourse));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const { page, search } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limit = Constants.PAGE_SIZE;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const course = await Course.find(query)
      .sort({ createdAt: -1 })
      .select("-__v -createdAt -updatedAt")
      .populate("subject", "-__v -createdAt -updatedAt")
      .populate("standard", "-__v -createdAt -updatedAt")
      .populate("boardId", "boardname boardshortname")
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    const totalReco = await Course.countDocuments(query);
    const totalPages = Math.ceil(totalReco / limit);

    return res.status(200).json(
      new APISuccess(200, "Course get all successfully", {
        docs: course,
        currentPage: pageNumber,
        totalPages: totalPages,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .select("-__v -createdAt -updatedAt")
      .populate("subject", "-__v -createdAt -updatedAt")
      .populate("standard", "-__v -createdAt -updatedAt")
      .populate("boardId", "boardname boardshortname");

    if (!course) {
      throw new APIError(404, "Course not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Course get by Id successfully", course));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      features,
      duration,
      skillLevel,
      thumbnail,
      price,
      subject,
      standard,
      bookPDF, // Optional field
      boardId, // Ensure boardId can also be updated if necessary
    } = req.body;

    // Validate required fields (if a field is undefined, it's not required)
    if (
      !title ||
      !description ||
      !thumbnail ||
      (!subject && !standard) ||
      !price ||
      !skillLevel ||
      !duration ||
      !features ||
      features.length === 0
    ) {
      throw new APIError(400, "All fields are required");
    }

    // Prepare the update object dynamically
    const updateData = {
      title,
      description,
      features,
      duration,
      skillLevel,
      thumbnail,
      price,
      subject,
      standard,
    };

    if (bookPDF) {
      updateData.bookPDF = bookPDF;
    }

    if (boardId) {
      updateData.boardId = boardId;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      projection: {
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    }).lean();

    if (!course) {
      throw new APIError(404, "Course not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Course updated successfully", course));
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle course active status
const toggleCourseActive = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { returnDocument: "after" }
    );

    if (!course) {
      throw new APIError(404, "Course not found");
    }
    return res
      .status(200)
      .json(new APISuccess(200, "Course status updated successfully", course));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all active courses.
const getEligibleOfrCourses = async (req, res) => {
  try {
    const { search } = req.body;
    const limit = 30;

    const query = {
      isActive: true,
      price: { $gt: 0 },
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(query).select("title").limit(limit);

    return res.status(200).json(
      new APISuccess(200, "Get all courses successfully", {
        courses,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  toggleCourseActive,
  getEligibleOfrCourses,
};
