const express = require("express");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  toggleCourseActive,
  getEligibleOfrCourses,
} = require("../../controllers/admin/coursecontroller");
const { authorization } = require("../../middlewares/authMiddlewares");
const { getUserCoursesTrack } = require("../../controllers/admin/courseTrackingController");
const router = express.Router();

router.post("/createcourse", authorization(true), createCourse);
router.get("/getallcourses", authorization(true), getAllCourses);
router.get("/getbyidcourse/:id", authorization(true), getCourseById);
router.put("/updatecourse/:id", authorization(true), updateCourse);
router.post("/coursetoggle", authorization(true), toggleCourseActive);
router.post(
  "/getEligibleOfrCourses",
  authorization(true),
  getEligibleOfrCourses,
);
router.post("/getUserCoursesTrack", authorization(true), getUserCoursesTrack);

module.exports = router;
