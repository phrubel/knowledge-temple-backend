"use strict";

const router = require("express").Router();
const paymentController = require("../../controllers/user/paymentController");

router.post("/getCheckoutDetails", paymentController.checkout);

router.post("/verifyPayment", paymentController.verifyPayout);

module.exports = router;
