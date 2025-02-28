"use strict";

const router = require("express").Router();
const activityController = require("../../controllers/user/activityController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/getActivities", authorization(), activityController.getAllActivity);

module.exports = router;
