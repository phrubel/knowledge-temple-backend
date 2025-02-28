const Mentor = require("../../models/Mentor.model");
const {APIError, APISuccess} = require("../../utils/responseHandler");
const {handleError} = require("../../utils/utility");
const Constants = require("../../constants/appConstants");

// Create Mentor
const createMentor = async (req, res) => {
  const {name, email, mobile, image, expertise, experienceYears, bio} =
    req.body;

  try {
    // Validate required fields
    if (
      !name ||
      !email ||
      !mobile ||
      !image ||
      !expertise ||
      !experienceYears ||
      !bio
    ) {
      throw new APIError(400, "Mentor all fields are required.");
    }

    const mentor = await Mentor.create({
      name,
      email,
      mobile,
      image,
      expertise,
      experienceYears,
      bio,
    });

    return res
      .status(200)
      .json(new APISuccess(201, "Mentor created successfully", mentor));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update Mentor
const updateMentor = async (req, res) => {
  try {
    const {id: mentorId} = req.params;
    const {name, email, mobile, image, expertise, experienceYears, bio} =
      req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !image ||
      !expertise ||
      !experienceYears ||
      !bio
    ) {
      throw new APIError(400, "Mentor all fields are required.");
    }
    const mentor = await Mentor.findByIdAndUpdate(
      mentorId,
      {name, email, mobile, image, expertise, experienceYears, bio},
      {new: true}
    ).lean();

    if (!mentor) {
      throw new APIError(404, "Mentor not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Mentor updated successfully", mentor));
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle Active/Deactive Mentor
const toggleActiveMentor = async (req, res) => {
  try {
    const {mentorId} = req.body;
    const mentor = await Mentor.findByIdAndUpdate(
      mentorId,
      [{$set: {isActive: {$not: "$isActive"}}}],
      {returnDocument: "after"}
    );
    if (!mentor) {
      throw new APIError(404, "Mentor not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Mentor status updated successfully", mentor));
  } catch (error) {
    return handleError(res, error);
  }
};

// Mentor Listing
const listMentors = async (req, res) => {
  try {
    const {page, search} = req.query;
    const pageNumber = parseInt(page) || 1;
    const limit = Constants.PAGE_SIZE;

    const query = {};
    if (search) {
      query.$or = [
        {name: {$regex: search, $options: "i"}},
        {email: {$regex: search, $options: "i"}},
        {mobile: {$regex: search, $options: "i"}}
      ];
    }

    const mentors = await Mentor.find(query)
      .sort({createdAt: -1})
      .select("-__v -createdAt -updatedAt")
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    const totalReco = await Mentor.countDocuments(query);
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

module.exports = {
  createMentor,
  updateMentor,
  toggleActiveMentor,
  listMentors,
};
