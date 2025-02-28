const express = require("express");
const { authorization } = require("../../middlewares/authMiddlewares");
const {
  createStandard,
  getAllStandards,
  getStandardById,
  updateStandard,
  toggleStandardActive,
} = require("../../controllers/admin/standardcontroller");

const router = express.Router();

router.post("/createstandard", authorization(true), createStandard);
router.get("/getallstandards", authorization(true), getAllStandards);
router.get("/getstandard/:id", authorization(true), getStandardById);
router.put("/updatestandard/:id", authorization(true), updateStandard);
router.post("/standardtoggle", authorization(true), toggleStandardActive);

module.exports = router;
