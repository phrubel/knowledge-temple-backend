"use strict";

const jwt = require("jsonwebtoken");
const { APIError, APISuccess } = require("../utils/responseHandler");
const { handleError } = require("../utils/utility");
const Constants = require("../constants/appConstants");

const generateToken = (user) => {
  const accessToken = jwt.sign({ user }, Constants.TOKEN_SECRET_KEY, {
    expiresIn: Constants.ACCESS_TOKEN_EXPIRED,
  });
  const refreshToken = jwt.sign({ user }, Constants.TOKEN_SECRET_KEY, {
    expiresIn: Constants.REFRESH_TOKEN_EXPIRED,
  });

  return {
    accessToken,
    refreshToken,
  };
};

async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  try {
    // Verify the refresh token with its secret
    const decoded = jwt.verify(refreshToken, Constants.TOKEN_SECRET_KEY);

    if (!decoded) {
      throw new APIError(427, "Refresh Token is Invalid");
    }

    const tokens = generateToken(decoded.user);

    return res
      .status(200)
      .send(new APISuccess(200, "Token Generated.", tokens));
  } catch (err) {
    console.error("Invalid refresh token:", err.message);
    return handleError(res, err);
  }
}

module.exports = {
  generateToken,
  refreshToken,
};
