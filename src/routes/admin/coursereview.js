const express = require("express");
const router = express.Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const {
    createCourseReview,
    getAllCourseReviews,
    getCourseReviewById,
    updateCourseReview,
    toggleActive
} = require("../../controllers/admin/coursereviewcontroller");

// Define routes
router.post("/createreview", authorization(true), createCourseReview); 
router.get("/allreview", authorization(true), getAllCourseReviews); 
router.get("/getidreview/:id", authorization(true), getCourseReviewById); 
router.put("/updatereview/:id", authorization(true), updateCourseReview); 
router.patch("/toggleactive/:id", authorization(true), toggleActive); 

module.exports = router;
