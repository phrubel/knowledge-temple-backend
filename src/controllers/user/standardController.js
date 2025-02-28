"use strict";

const { APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Standard = require("../../models/standardModel");

exports.getAllStandard = async function (req, res) {
  try {
    const standard = await Standard.find({ isActive: true }).select("std");
    return res
      .status(200)
      .json(new APISuccess(200, "Standards fetch successfully", standard));
  } catch (error) {
    return handleError(res, error);
  }
};
