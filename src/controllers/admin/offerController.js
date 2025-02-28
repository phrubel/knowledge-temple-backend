const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");
const Offer = require("../../models/offerModel");

// Add Offer
exports.addOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      offrPer,
      startAt,
      endAt,
      courses,
      quizzes,
    } = req.body;

    // Validation
    if (title && (typeof title !== "string" || title.trim() === "")) {
      throw new APIError(400, "Invalid 'title'.");
    }
    if (image && (typeof image !== "string" || image.trim() === "")) {
      throw new APIError(400, "Invalid 'image' url.");
    }
    if (
      description &&
      (typeof description !== "string" || description.trim() === "")
    ) {
      throw new APIError(400, "Invalid 'description'.");
    }
    if (
      offrPer &&
      (typeof offrPer !== "number" || offrPer <= 0 || offrPer > 100)
    ) {
      throw new APIError(400, "'offrPer' must be a number between 1 and 100.");
    }
    if (startAt && isNaN(new Date(startAt).getTime())) {
      throw new APIError(400, "Invalid 'startAt'.");
    }
    if (endAt && isNaN(new Date(endAt).getTime())) {
      throw new APIError(400, "Invalid 'endAt'.");
    }
    if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
      throw new APIError(400, "'endAt' must be after 'startAt'.");
    }
    if (courses && !Array.isArray(courses)) {
      throw new APIError(400, "'courses' must be an array of IDs.");
    } else if (quizzes && !Array.isArray(quizzes)) {
      throw new APIError(400, "'quizzes' must be an array of IDs.");
    }

    if (courses.length == 0 && quizzes.length == 0) {
      throw new APIError(400, "At least apply one course or quiz.");
    }

    // Create Offer
    const offer = new Offer({
      title,
      description,
      image,
      offrPer,
      startAt,
      endAt,
      courses,
      quizzes,
    });
    await offer.save();

    return res
      .status(200)
      .json(new APISuccess(200, "Offer created successfully", offer));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get Offer by ID
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    // .populate("courses quizzes");
    if (!offer) throw new APIError(404, "Offer not found");

    return res
      .status(200)
      .json(new APISuccess(200, "Fetch Offer Success.", offer));
  } catch (error) {
    return handleError(res, error);
  }
};

// List Offers with Pagination
exports.listOffers = async (req, res) => {
  try {
    const { page = 1, search } = req.query;
    const limit = Constants.PAGE_SIZE;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const offers = await Offer.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Offer.countDocuments(query);

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

// Update Offer
exports.updateOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      offrPer,
      startAt,
      endAt,
      courses,
      quizzes,
    } = req.body;

    // Validation
    if (title && (typeof title !== "string" || title.trim() === "")) {
      throw new APIError(400, "Invalid 'title'.");
    }
    if (image && (typeof image !== "string" || image.trim() === "")) {
      throw new APIError(400, "Invalid 'image' url.");
    }
    if (
      description &&
      (typeof description !== "string" || description.trim() === "")
    ) {
      throw new APIError(400, "Invalid 'description'.");
    }
    if (
      offrPer &&
      (typeof offrPer !== "number" || offrPer <= 0 || offrPer > 100)
    ) {
      throw new APIError(400, "'offrPer' must be a number between 1 and 100.");
    }
    if (startAt && isNaN(new Date(startAt).getTime())) {
      throw new APIError(400, "Invalid 'startAt'.");
    }
    if (endAt && isNaN(new Date(endAt).getTime())) {
      throw new APIError(400, "Invalid 'endAt'.");
    }
    if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
      throw new APIError(400, "'endAt' must be after 'startAt'.");
    }
    if (courses && !Array.isArray(courses)) {
      throw new APIError(400, "'courses' must be an array of IDs.");
    } else if (quizzes && !Array.isArray(quizzes)) {
      throw new APIError(400, "'quizzes' must be an array of IDs.");
    }

    if (courses.length == 0 && quizzes.length == 0) {
      throw new APIError(400, "At least apply one course or quiz.");
    }

    // Update Offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { title, description, image, offrPer, startAt, endAt, courses, quizzes },
      { new: true }
    );

    if (!updatedOffer) {
      throw new APIError(404, "Offer not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Offer updated successfully", updatedOffer));
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete Offer
exports.deleteOffer = async (req, res) => {
  try {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);

    if (!deletedOffer) {
      throw new APIError(404, "Offer not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Offer deleted successfully"));
  } catch (error) {
    return handleError(res, error);
  }
};
