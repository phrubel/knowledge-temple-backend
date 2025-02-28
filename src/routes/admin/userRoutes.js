"use strict";

const router = require("express").Router();
const userController = require("../../controllers/admin/usercontroller");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/all", authorization(true), userController.getUsersListing);

router.post("/toggleBlockUser", authorization(true), userController.blockUser);

router.post(
  "/updateUserDetails",
  authorization(true),
  userController.updateUserDetails,
);

router.post("/getUserDetails", authorization(true), userController.getUserDetails);

module.exports = router;
