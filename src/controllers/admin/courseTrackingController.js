const { APISuccess, APIError } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const CourseTracking = require("../../models/courseTracking.model");
const mongoose = require("mongoose");

exports.getUserCoursesTrack = async (req, res) => {
  try {
    const { userId } = req.body;
    // const pageNo = parseInt(page) || 1;
    // const skip = (pageNo - 1) * Constants.PAGE_SIZE;

    if (!userId) {
      throw new APIError(400, "User ID is required");
    }

    // Fetch category-wise course completion
    const categoryCompletion = await CourseTracking.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Ensure userId is an ObjectId
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: {
          path: "$course",
          preserveNullAndEmptyArrays: false, // Ensures we exclude null course entries
        },
      },
      {
        $group: {
          _id: "$course._id",
          courseTitle: { $first: "$course.title" },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
    ]);

    // Format category-wise data
    const formattedCategoryData = categoryCompletion.map((item) => ({
      _id: item._id,
      courseTitle: item.courseTitle,
      completionRate: item.total ? (item.completed / item.total) * 100 : 0,
    }));

    return res.status(200).json(new APISuccess(200, "Courses Tracked", {
      courseTracking: formattedCategoryData,
      // total: Math.ceil(totalRec / Constants.PAGE_SIZE),
      // currentPage: pageNo,
    }));
  } catch (error) {
    return handleError(res, error);
  }
};

