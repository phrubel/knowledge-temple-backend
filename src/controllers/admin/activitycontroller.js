const Activity = require("../../models/activityModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");

// Create new activity
const createActivity = async (req, res) => {
  try {
    const { activityname } = req.body;

    // Validate required fields
    if (!activityname) {
      throw new APIError(400, "Activity name is required");
    }

    const activity = await Activity.create({
      activityname,
    });

    return res
      .status(200)
      .json(new APISuccess(200, "Activity created successfully", activity));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all activities
const getAllActivities = async (req, res) => {
  try {
    const activitie = await Activity.find();
    return res
      .status(200)
      .json(new APISuccess(200, "Activities get all successfully", activitie));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get activity by ID
const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.body;

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      {
        returnDocument: "after",
      }
    );

    if (!activity) {
      throw new APIError(404, "Activity not found");
    }
    return res
      .status(200)
      .json(new APISuccess(200, "Activity get by id successfully", activity));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { activityname } = req.body;

    // Validate required fields
    if (!activityname) {
      throw new APIError(400, "Activity name is required");
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        activityname,
      },
      { new: true }
    );

    if (!activity) {
      throw new APIError(404, "Activity not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Activity updated successfully", activity));
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle activity active status
const toggleActive = async (req, res) => {
  try {
    const { activityId } = req.body;

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { returnDocument: "after" }
    );

    if (!activity) {
      throw new APIError(404, "Activity not found");
    }
    return res
      .status(200)
      .json(
        new APISuccess(200, "Activity status updated  successfully", activity)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  toggleActive,
};
// Toggle activity active status
