"use strict";

const router = require("express").Router();
const materialController = require("../../controllers/user/materialController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.post("/getMaterial", authorization(), materialController.getMaterial);

router.post(
  "/getMaterialDetails",
  authorization(),
  materialController.getMaterialDetails
);

router.post(
  "/getCoursesMaterial",
  authorization(),
  materialController.getCoursesMaterial
);

module.exports = router;
