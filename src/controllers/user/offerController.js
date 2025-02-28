const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");
const Offer = require("../../models/offerModel");

// List Offers with Pagination
exports.listOffers = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = Constants.PAGE_SIZE;
    const offers = await Offer.find({ endAt: { $gt: Date.now() } })
      .select("-courses -quizzes")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Offer.countDocuments();

    return res.status(200).json(
      new APISuccess(200, "Offers Fetched.", {
        offers,
        total: Math.ceil(total / limit),
        currentPage: parseInt(page),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};
