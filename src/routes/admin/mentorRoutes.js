const express = require("express");
const {
  createMentor,
  updateMentor,
  toggleActiveMentor,
  listMentors,
} = require("../../controllers/admin/mentorcontroller");
const { authorization } = require("../../middlewares/authMiddlewares");
const router = express.Router();

router.post("/creatementors", authorization(true), createMentor);
router.get("/fetchmentors", authorization(true), listMentors);
router.put("/:id", authorization(true), updateMentor);
router.post("/mentorstoggle", authorization(true), toggleActiveMentor);

module.exports = router;
