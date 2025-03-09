const Lesson = require("../../models/lessonmodel");
const Course = require("../../models/courseModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");

// Create new lesson
const createLesson = async (req, res) => {
  try {
    const { courseId, lessons, subject, standard, boardId } = req.body;
    console.log(req.body);
    if (!courseId) {
      throw new APIError(400, "Course ID is required");
    }

    if (!lessons || lessons.length === 0) {
      throw new APIError(400, "Lessons are required");
    }

    // Validate required fields in each lesson
    lessons.forEach((lesson) => {
      if (!lesson.title || !lesson.description) {
        throw new APIError(400, "Lesson title and description are required");
      }
      lesson.courseId = courseId; // Assign courseId to each lesson dynamically

      // Add optional fields only if provided
      if (subject) lesson.subject = subject;
      if (standard) lesson.standard = standard;
      if (boardId) lesson.boardId = boardId;
    });

    const course = await Course.findById(courseId);

    if (!course) {
      throw new APIError(404, "Course not found");
    }

    // Insert lessons
    const createdLessons = await Lesson.insertMany(lessons);

    // Add new lesson IDs to the course
    createdLessons.forEach((lesson) => course.lessons.push(lesson._id));

    await course.save();

    return res
      .status(200)
      .json(new APISuccess(200, "Lesson created successfully", createdLessons));
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
