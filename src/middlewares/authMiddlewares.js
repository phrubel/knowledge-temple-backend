"use strict";

const crypto = require("crypto"); // For encryption/decryption
const User = require("../models/userModel");
const { APIError } = require("../utils/responseHandler");
const jwt = require("jsonwebtoken");
const Constants = require("../constants/appConstants");

// Encryption/Decryption Keys
const ENCRYPTION_KEY = crypto.randomBytes(32); // 32 bytes key
const IV_LENGTH = 16; // Initialization vector length

// Helper functions for encryption and decryption
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(text) {
  const [iv, encrypted] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Middleware for checking required headers
function validateHeaders(req, res, next) {
  const {
    appversion,
    appbuildnumber,
    devicetype,
    "x-localization": xLocalization,
  } = req.headers;

  if (!appversion || !appbuildnumber || !devicetype || !xLocalization) {
    return res
      .status(400)
      .json(new APIError(400, "Missing required headers.").toJson());
  }
  req.deviceType = devicetype;
  req.appVersion = appversion;
  req.appBuildNumber = appbuildnumber;
  req.xLocalization = xLocalization;

  next();
}

// Middleware for decryption of request body
function decryptRequest(req, res, next) {
  if (req.body.encryptedData) {
    try {
      req.body = JSON.parse(decrypt(req.body.encryptedData));
    } catch (error) {
      return res.status(400).json({ error: "Invalid encrypted data" });
    }
  }
  next();
}

// Middleware for encryption of response
function encryptResponse(req, res, next) {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === "object") {
      body = encrypt(JSON.stringify(body));
    }
    originalSend.call(this, body);
  };
  next();
}

// Middleware for authentication
function authorization(isAdmin = false) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(new APIError(401, "Unauthorized").toJson());
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, Constants.TOKEN_SECRET_KEY);

      // Fetch user from database
      const user = await User.findById(decoded.user._id).lean();

      console.log("check ====> ", decoded);

      // Check if user exists and is not blocked
      if (!user || user.isBlocked) {
        return res
          .status(403)
          .json(
            new APIError(
              403,
              `${isAdmin ? "Admin" : "User"} not found or blocked.`
            ).toJson()
          );
      }

      if (isAdmin && user.userRole != "admin" && user.userRole != "both") {
        return res
          .status(403)
          .json(new APIError(403, "Unauthorized access.").toJson());
      }

      // Attach user to request object
      req.user = user;

      // Proceed to next middleware
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(401).json(new APIError(401, "Unauthorized").toJson());
    }
  };
}

module.exports = {
  authorization,
  validateHeaders,
  decryptRequest,
  encryptResponse,
};
