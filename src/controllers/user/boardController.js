"use strict";

const { APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Board = require("../../models/boardModel");

exports.getAllBoard = async function (req, res) {
  try {
    const boards = await Board.find({ isActive: true }).select(
      "boardname boardshortname"
    );
    return res
      .status(200)
      .json(new APISuccess(200, "Boards fetch successfully", boards));
  } catch (error) {
    return handleError(res, error);
  }
};
