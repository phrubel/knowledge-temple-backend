"use strict";

const router = require("express").Router();
const courseController = require("../../controllers/user/courseController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.post("/getCourses", authorization(), courseController.getCourses);

router.post("/getCourseDetail", authorization(), courseController.getCourseDetail);

router.post("/enroll", authorization(), courseController.enrollCourse);

router.get("/courseProgress", authorization(), courseController.getCourseProgress);

module.exports = router;
