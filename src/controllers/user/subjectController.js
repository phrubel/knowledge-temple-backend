"use strict";

const { APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Subject = require("../../models/subjectModel");

exports.getAllSubjects = async function (req, res) {
  try {
    const { standard } = req.query;

    const query = { isActive: true };

    if (standard) {
      query.standard = standard;
    }
    // else {
    //   query.standard = { $exists: false };
    // }

    const subjects = await Subject.find(query)
      .select("subject")
      .populate("standard", "std");

    return res
      .status(200)
      .json(new APISuccess(200, "Subject fetch successfully", subjects));
  } catch (error) {
    return handleError(res, error);
  }
};
