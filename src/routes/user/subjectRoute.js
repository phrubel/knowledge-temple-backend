"use strict";

const router = require("express").Router();
const subjectController = require("../../controllers/user/subjectController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/getSubjects", authorization(), subjectController.getAllSubjects);

module.exports = router;
