const express = require("express");
const router = express.Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const mentorController = require("../../controllers/user/mentorController");

router.get("/mentors", authorization(), mentorController.listMentors);

module.exports = router;
