'use strict';

const router = require('express').Router();
const paymentController = require('../../controllers/user/paymentController');

router.post('/getCheckoutDetails', paymentController.checkout);

router.post('/verifyPayment', paymentController.verifyPayout);

router.post('/deposit', paymentController.deposit);

router.post('/withdraw', paymentController.withdrawAmount);

module.exports = router;
