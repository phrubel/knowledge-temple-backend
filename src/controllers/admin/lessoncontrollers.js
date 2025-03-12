const Lesson = require("../../models/lessonmodel");
const Course = require("../../models/courseModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");

// Create new lesson
const createLesson = async (req, res) => {
  try {
    const { lessons } = req.body;
    console.log(req.body);

    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      throw new APIError(400, "Lessons are required and should be an array");
    }

    // Validate required fields in each lesson
    const courseIds = new Set(); // Unique course IDs track করার জন্য

    for (const lesson of lessons) {
      if (!lesson.title || !lesson.description || !lesson.courseId) {
        throw new APIError(
          400,
          "Lesson title, description, and courseId are required for each lesson"
        );
      }
      courseIds.add(lesson.courseId);
    }

    // Check if all course IDs exist in the database
    const courses = await Course.find({ _id: { $in: Array.from(courseIds) } });

    if (courses.length !== courseIds.size) {
      throw new APIError(404, "One or more Course IDs are invalid");
    }

    // Insert lessons into the database
    const createdLessons = await Lesson.insertMany(lessons);

    // Map lessons to their respective courses
    const courseMap = new Map();
    courses.forEach((course) => courseMap.set(course._id.toString(), course));

    createdLessons.forEach((lesson) => {
      const course = courseMap.get(lesson.courseId.toString());
      if (course) {
        course.lessons.push(lesson._id);
      }
    });

    // Save all courses
    await Promise.all(courses.map((course) => course.save()));

    return res
      .status(200)
      .json(
        new APISuccess(200, "Lessons created successfully", createdLessons)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

// const createLesson = async (req, res) => {
//   try {
//     const { courseId, lessons, subject, standard, boardId,  } = req.body;
//     console.log(req.body);
//     if (!courseId) {
//       throw new APIError(400, "Course ID is required");
//     }

//     if (!lessons || lessons.length === 0) {
//       throw new APIError(400, "Lessons are required");
//     }

//     // Validate required fields in each lesson
//     lessons.forEach((lesson) => {
//       if (!lesson.title || !lesson.description) {
//         throw new APIError(400, "Lesson title and description are required");
//       }
//       lesson.courseId = courseId; // Assign courseId to each lesson dynamically

//       // Add optional fields only if provided
//       if (subject) lesson.subject = subject;
//       if (standard) lesson.standard = standard;
//       if (boardId) lesson.boardId = boardId;
//     });

//     const course = await Course.findById(courseId);

//     if (!course) {
//       throw new APIError(404, "Course not found");
//     }

//     // Insert lessons
//     const createdLessons = await Lesson.insertMany(lessons);

//     // Add new lesson IDs to the course
//     createdLessons.forEach((lesson) => course.lessons.push(lesson._id));

//     await course.save();

//     return res
//       .status(200)
//       .json(new APISuccess(200, "Lesson created successfully", createdLessons));
//   } catch (error) {
//     return handleError(res, error);
//   }
// };

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
      .populate("boardId", "boardname boardshortname")
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
      .populate("courseId", "title description")
      .populate("boardId", "boardname boardshortname");
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
