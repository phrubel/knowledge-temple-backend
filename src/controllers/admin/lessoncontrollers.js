const Lesson = require("../../models/lessonmodel");
const Course = require("../../models/courseModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");

// Create new lesson
const createLesson = async (req, res) => {
  try {
    const { courseId, lessons } = req.body;

    if (!courseId) {
      throw new APIError(400, "Course ID is required");
    }

    if (!lessons || lessons.length === 0) {
      throw new APIError(400, "Lessons are required");
    }

    // Validate lesson required fields
    for (let lesson of lessons) {
      if (!lesson.title || !lesson.description) {
        throw new APIError(400, "Lesson All fields are required");
      }
      lesson.courseId = courseId;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      throw new APIError(404, "Course not found");
    }

    const lesson = await Lesson.insertMany(lessons);

    lesson.map((lesson) => {
      return course.lessons.push(lesson._id);
    });

    await course.save();

    return res
      .status(200)
      .json(new APISuccess(200, "Lesson created successfully", lesson));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all lessons
const getAllLessons = async (req, res) => {
  try {
    const { page, search } = req.query;
    const limit = Constants.PAGE_SIZE;
    const pageNumber = page ? parseInt(page) : 1;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const lesson = await Lesson.find(query)
      .sort({ createdAt: -1 })
      .populate("courseId", "title description")
      .skip(limit * (pageNumber - 1))
      .limit(limit);

    const totalRec = await Lesson.countDocuments(query);

    return res.status(200).json(
      new APISuccess(200, "get all Lessons successfully", {
        docs: lesson,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRec / limit),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get lesson by ID
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .select("-__v -createdAt")
      .populate("courseId", "title description");

    if (!lesson) {
      throw new APIError(404, "Lesson not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "get lesson by Id successfully", lesson));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const { title, description, materialType, materialUrl } = req.body;

    // Validate required fields
    if (!title || !description) {
      throw new APIError(400, "All fields are required");
    }

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        materialType: materialType || "none",
        materialUrl: materialUrl || "",
      },
      { new: true }
    );

    if (!lesson) {
      throw new APIError(404, "Lesson not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Lessons updata successfully", lesson));
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete lesson (soft delete by setting isActive to false)
const toggleActive = async (req, res) => {
  try {
    const { lessonId } = req.body;

    if (!lessonId) {
      throw new APIError(400, "Lesson ID is required");
    }

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      {
        returnDocument: "after",
      }
    );

    if (!lesson) {
      throw new APIError(404, "Lesson not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Lessons status updata successfully", lesson));
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  toggleActive,
};
