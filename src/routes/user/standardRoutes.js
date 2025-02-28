"use strict";

const router = require("express").Router();
const standardController = require("../../controllers/user/standardController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/getStandards", authorization(), standardController.getAllStandard);

module.exports = router;
