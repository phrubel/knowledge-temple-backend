const Lesson = require("../../models/lessonmodel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Constants = require("../../constants/appConstants");

// Create material
const createMaterial = async (req, res) => {
  try {
    const { courseId, material } = req.body;

    // Validate required fields
    if (
      !courseId ||
      !material ||
      !material.title ||
      !material.materialType ||
      material.materialType == "none" ||
      material.materialUrl == ""
    ) {
      throw new APIError(400, "Material fields are required");
    }
    material.courseId = courseId;
    material.isMaterial = true;

    const materialRes = await Lesson.create(material);

    return res
      .status(200)
      .json(new APISuccess(200, "Material created successfully", materialRes));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all materials
const getAllMaterials = async (req, res) => {
  try {
    const { page } = req.query;
    const limit = Constants.PAGE_SIZE;
    const pageNo = parseInt(page, 10) || 1;

    const material = await Lesson.find({ isMaterial: true })
      .sort({ createdAt: -1 })
      .populate("courseId", "title description")
      .skip(limit * (pageNo - 1))
      .limit(limit);

    const totalRec = await Lesson.countDocuments({ isMaterial: true });

    return res.status(200).json(
      new APISuccess(200, "Get AllMaterial successfully", {
        docs: material,
        currentPage: pageNo,
        totalPages: Math.ceil(totalRec / limit),
      })
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get material by ID
const getMaterialById = async (req, res) => {
  try {
    const material = await Lesson.findById(req.params.id).populate(
      "courseId",
      "title description"
    );

    if (!material) {
      throw new APIError(404, "Material not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Get material by id successfully", material));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update material
const updateMaterial = async (req, res) => {
  try {
    const { materialId, title, materialType, materialUrl } = req.body;

    // Validate required fields
    if (
      !materialId ||
      !title ||
      !materialType ||
      materialType == "none" ||
      materialUrl == ""
    ) {
      throw new APIError(400, "Material fields are required");
    }

    const material = await Lesson.findByIdAndUpdate(
      materialId,
      {
        title,
        materialType,
        materialUrl,
      },
      { new: true }
    );

    if (!material) {
      throw new APIError(404, "Material not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Material updated successfully", material));
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle material active status
const toggleActive = async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      throw new APIError(400, "Material ID is required");
    }

    const material = await Lesson.findByIdAndUpdate(
      materialId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { returnDocument: "after" }
    );

    if (!material) {
      throw new APIError(404, "Material not found");
    }

    return res
      .status(200)
      .json(
        new APISuccess(200, "Material status Updated successfully", material)
      );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  toggleActive,
};
