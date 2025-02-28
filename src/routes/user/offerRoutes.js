const express = require("express");
const router = express.Router();
const offerController = require("../../controllers/user/offerController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/getOffers", authorization(), offerController.listOffers);

module.exports = router;
