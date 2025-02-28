const router = require("express").Router();
const courTracking = require("../../controllers/user/courseTrackingController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.post("/trackCourse", authorization(), courTracking.trackCourse);

router.get("/getCourseTracking", authorization(), courTracking.getCourseTracking);

module.exports = router;