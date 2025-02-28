const Board = require("../../models/boardModel");
const { APIError, APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");

// Create new board
const createBoard = async (req, res) => {
  try {
    const { boardname, boardshortname } = req.body;

    if (!boardname || !boardshortname) {
      throw new APIError(400, "Board name and short name are required");
    }

    const board = await Board.create({
      boardname,
      boardshortname,
    });

    return res
      .status(200)
      .json(new APISuccess(200, "Board created successfully", board));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all boards
const getAllBoards = async (req, res) => {
  try {
    const board = await Board.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new APISuccess(200, "Boards fetch successfully", board));
  } catch (error) {
    return handleError(res, error);
  }
};

// Get board by ID
const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      throw new APIError(404, "Board not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Boards id by fetch  successfully", board));
  } catch (error) {
    return handleError(res, error);
  }
};

// Update board
const updateBoard = async (req, res) => {
  try {
    const { boardname, boardshortname } = req.body;

    // Validate required fields
    if (!boardname || !boardshortname) {
      throw new APIError(400, "Board name and short name are required");
    }

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      {
        boardname,
        boardshortname,
      },
      { new: true }
    );

    if (!board) {
      throw new APIError(404, "Board not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Board updated successfully", board));
  } catch (error) {
    return handleError(res, error);
  }
};

// Toggle board active status
const toggleActive = async (req, res) => {
  try {
    const { boardId } = req.body;

    const board = await Board.findByIdAndUpdate(
      boardId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      {
        returnDocument: "after",
      }
    );

    if (!board) {
      throw new APIError(404, "Board not found");
    }

    return res
      .status(200)
      .json(new APISuccess(200, "Board status updata successfully", board));
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  toggleActive,
};
