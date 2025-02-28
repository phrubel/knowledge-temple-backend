"use strict";

const router = require("express").Router();
const userController = require("../../controllers/user/userController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/getProfile", authorization(), userController.getProfile);

router.post("/getOtp", userController.getOTP);

router.post("/verifyOtp", userController.verifyOTP);

router.post("/createPassword", userController.createPassword);

router.put("/updateProfile", authorization(), userController.updateProfile);

router.delete("/deleteAccount", authorization(), userController.deleteAccount);

router.post("/signIn", userController.signIn);

router.post("/forgotPassword", userController.forgotPassword);

router.delete("/deleteAccount", authorization(), userController.deleteAccount);

router.post("/logout", authorization(), userController.logout);

router.post("/changePassword", authorization(), userController.changePassword)

module.exports = router;
