const Standard = require("../../models/standardModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");

// Create new standard
const createStandard = async (req, res) => {
  try {
    const { std } = req.body;

    // Validate required fields
    if (!std) {
      throw new APIError(400, "Standard name is required");
    }

    const standard = await Standard.create({ std });

    return res
      .status(200)
      .json(new APISuccess(200, "Standard created successfully", standard));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all standards
const getAllStandards = async (req, res) => {
  try {
    const standard = await Standard.find();
    return res
      .status(200)
      .json(new APISuccess(200, "Standards fetch successfully", standard));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get standard by ID
const getStandardById = async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id);

    if (!standard) {
      throw new APIError(404, "Standard not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Standard fetch by Id successfully", standard));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update standard by ID
const updateStandard = async (req, res) => {
  try {
    const { std } = req.body;

    // Validate required fields
    if (!std) {
      throw new APIError(400, "Standard name is required");
    }

    const standard = await Standard.findByIdAndUpdate(
      req.params.id,
      { std },
      { new: true }
    );

    if (!standard) {
      throw new APIError(404, "Standard not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Standard updated successfully", standard));
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle standard active status
const toggleStandardActive = async (req, res) => {
  try {
    const { stdId } = req.body;

    const standard = await Standard.findByIdAndUpdate(
      stdId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      {
        returnDocument: "after",
      }
    );

    if (!standard) {
      return APIError(404, "Standard not found");
    }
    return res
      .status(200)
      .json(
        new APISuccess(200, "Standard status updated successfully", standard)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createStandard,
  getAllStandards,
  getStandardById,
  updateStandard,
  toggleStandardActive,
};
