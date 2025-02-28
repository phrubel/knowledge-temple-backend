const CourseReview = require("../../models/coursereviewModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");

// Create Course Review
const createCourseReview = async (req, res) => {
  const { courseId, userId, rating, review } = req.body;

  try {
    // Validate required fields
    if (!courseId || !userId || !rating || !review) {
      throw new APIError(400, "All fields are required", 400);
    }

    if (rating < 1 || rating > 5) {
      throw new APIError(400, "Rating must be between 1 and 5", 400);
    }

    const courseReview = await CourseReview.create({
      courseId,
      userId,
      rating,
      review,
    });
    return res
      .status(200)
      .json(
        new APISuccess(200, "Course review created successfully", courseReview)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get All Course Reviews
const getAllCourseReviews = async (req, res) => {
  try {
    const courseReviews = await CourseReview.find().populate("courseId userId");
    return res
      .status(200)
      .json(
        new APISuccess(
          200,
          "Course reviews fetched successfully",
          courseReviews
        )
      );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get Course Review by ID
const getCourseReviewById = async (req, res) => {
  try {
    const courseReview = await CourseReview.findById(req.params.id).populate(
      "courseId userId"
    );
    if (!courseReview) {
      throw new APIError(404, "Course review not found");
    }
    return res
      .status(200)
      .json(
        new APISuccess(200, "Course review fetched successfully", courseReview)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

// Update Course Review
const updateCourseReview = async (req, res) => {
  const { rating, review } = req.body;

  try {
    // Validate required fields
    if (rating && (rating < 1 || rating > 5)) {
      throw new APIError(400, "Rating must be between 1 and 5");
    }

    const courseReview = await CourseReview.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true }
    );

    if (!courseReview) {
      throw new APIError(404, "Course review not found");
    }

    return res
      .status(200)
      .json(
        new APISuccess(200, "Course review updated successfully", courseReview)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle Course Review Active Status
const toggleActive = async (req, res) => {
  try {
    const courseReview = await CourseReview.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!courseReview) {
      throw new APIError(404, "Course review not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Course review status updated successfully"));
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createCourseReview,
  getAllCourseReviews,
  getCourseReviewById,
  updateCourseReview,
  toggleActive,
};
// Toggle Course Review Active Status
