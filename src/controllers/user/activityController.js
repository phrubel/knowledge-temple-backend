"use strict";

const { APISuccess } = require("../../utils/responseHandler");
const { handleError } = require("../../utils/utility");
const Activity = require("../../models/activityModel");

exports.getAllActivity = async function (req, res) {
  try {
    const activities = await Activity.find({ isActive: true }).select(
      "activityname"
    );
    return res
      .status(200)
      .json(new APISuccess(200, "Activities fetch successfully", activities));
  } catch (error) {
    return handleError(res, error);
  }
};
