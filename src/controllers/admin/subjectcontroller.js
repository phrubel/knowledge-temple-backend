const Subject = require("../../models/subjectModel");
const { APISuccess, APIError } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");

// Create new subject
exports.createSubject = async (req, res) => {
  try {
    const { subject, standard } = req.body;

    if (!subject) {
      throw new APIError(400, "Subject name is required");
    }

    const newSubject = await Subject.create({
      subject,
      standard: standard || null,
    });

    const subjectData = await Subject.findById(newSubject._id).populate(
      "standard"
    );

    return res
      .status(200)
      .json(new APISuccess(200, "Subject created successfully", subjectData));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const { standard } = req.query;
    let query = {};
    if (standard) {
      query.standard = standard;
    }
    const subjects = await Subject.find(query)
      .populate("standard")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new APISuccess(200, "Subjects retrieved successfully", subjects));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      throw new APIError(404, "Subject not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Subject retrieved successfully", subject));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { subject, standard } = req.body;

    if (!subject) {
      throw new APIError(400, "Subject name is required");
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { subject, standard },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      throw new APIError(404, "Subject not found");
    }

    return res
      .status(200)
      .json(
        new APISuccess(200, "Subject updated successfully", updatedSubject)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete subject (soft delete by setting isActive to false)
exports.toggleSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;

    const deletedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { returnDocument: "after" }
    );

    if (!deletedSubject) {
      throw new APIError(404, "Subject not found");
    }

    return res
      .status(200)
      .json(
        new APISuccess(
          200,
          "Subject status updated  successfully",
          deletedSubject
        )
      );
  } catch (error) {
    return handleError(res, error);
  }
};
