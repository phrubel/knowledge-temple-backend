const express = require("express");
const router = express.Router();
const offerController = require("../../controllers/admin/offerController");

router.post("/", offerController.addOffer);
router.get("/", offerController.listOffers);
router.get("/:id", offerController.getOffer);
router.put("/:id", offerController.updateOffer);
router.delete("/:id", offerController.deleteOffer);

module.exports = router;
