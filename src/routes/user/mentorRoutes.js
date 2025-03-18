const express = require('express');
const router = express.Router();
const { authorization } = require('../../middlewares/authMiddlewares');
const mentorController = require('../../controllers/user/mentorController');

router.get('/mentors', authorization(), mentorController.listMentors);
router.get('/mentors/:id', authorization(), mentorController.mentorsDetails);

module.exports = router;
