"use strict";

const router = require("express").Router();
const adminAuthController = require("../../controllers/admin/adminauthcontroller");
const { authorization } = require("../../middlewares/authMiddlewares");

router.post("/login", adminAuthController.adminLogin);

router.get("/getProfile", authorization(true), adminAuthController.getProfile);

module.exports = router;
