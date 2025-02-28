const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const CourseTracking = require("../../models/courseTracking.model");

exports.trackCourse = async (req, res) => {
  try {
    const { courseId, lessonId, status } = req.body;
    const { _id: userId } = req.user;

    if (!userId || !courseId) {
      throw new APIError(400, "User ID and Course ID are required");
    }

    if (!status) {
      throw new APIError(400, "Status is required");
    }

    // Check if tracking entry already exists
    let tracking = await CourseTracking.findOne({ userId, courseId, lessonId });

    if (tracking) {
      tracking.status = status || tracking.status;
      tracking.updatedAt = new Date();
      await tracking.save();
    } else {
      tracking = new CourseTracking({ userId, courseId, lessonId, status });
      await tracking.save();
    }

    return res.status(200).json(new APISuccess(200, "Course Tracked Success.", tracking));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getCourseTracking = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    if (!userId) {
      throw new APIError(400, "User ID is required");
    }

    // Fetch total courses tracked by user
    const totalCourses = await CourseTracking.countDocuments({ userId });

    // Fetch completed courses
    const completedCourses = await CourseTracking.countDocuments({ userId, status: "completed" });

    // Calculate completion percentage
    const completedPercentage = totalCourses ? (completedCourses / totalCourses) * 100 : 0;
    const ongoingPercentage = 100 - completedPercentage;

    // Fetch monthly progress data
    const monthlyData = await CourseTracking.aggregate([{ $match: { userId } }, {
      $group: {
        _id: {
          month: { $month: "$createdAt" }, year: { $year: "$createdAt" },
        }, count: { $sum: 1 },
      },
    }, { $sort: { "_id.year": 1, "_id.month": 1 } }]);

    // Format monthly progress
    const formattedMonthlyData = monthlyData.map((item) => ({
      month: item._id.month, year: item._id.year, count: item.count,
    }));

    // Fetch category-wise course completion
    const categoryCompletion = await CourseTracking.aggregate([{ $match: { userId } }, {
      $lookup: {
        from: "courses", localField: "courseId", foreignField: "_id", as: "course",
      },
    }, { $unwind: "$course" }, {
      $group: {
        _id: "$course._id",
        courseTitle: { $first: "$course.title" },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        }, total: { $sum: 1 },
      },
    }]);

    // Format category-wise data
    const formattedCategoryData = categoryCompletion.map((item) => ({
      courseTitle: item.courseTitle, completionRate: item.total ? (item.completed / item.total) * 100 : 0,
    }));

    return res.status(200).json(new APISuccess(200, "Course Tracked Success.", {
      completionRate: {
        completed: completedPercentage.toFixed(2), ongoing: ongoingPercentage.toFixed(2),
      }, monthlyProgress: formattedMonthlyData, categoryWiseCompletion: formattedCategoryData,
    }));
  } catch (error) {
    return handleError(res, error);
  }
};
