const { APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");
const Mentor = require("../../models/Mentor.model");

// Mentor Listing
exports.listMentors = async (req, res) => {
  try {
    const { page } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limit = Constants.PAGE_SIZE;

    const mentors = await Mentor.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("-__v -createdAt -updatedAt")
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    const totalReco = await Mentor.countDocuments();
    const totalPages = Math.ceil(totalReco / limit);

    return res.status(200).json(
      new APISuccess(200, "Mentors retrieved successfully", {
        docs: mentors,
        currentPage: pageNumber,
        totalPages: totalPages,
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
