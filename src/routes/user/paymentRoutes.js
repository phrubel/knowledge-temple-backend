'use strict';

const router = require('express').Router();
const paymentController = require('../../controllers/user/paymentController');

const { authorization } = require('../../middlewares/authMiddlewares');

router.post('/getCheckoutDetails', paymentController.checkout);

//routes for done

router.post('/verifyPayment', paymentController.verifyPayout);

//deposit routes
router.post('/deposit', paymentController.deposit);

router.post('/withdraw', paymentController.withdrawAmount);

router.get(
  '/transactions/:userId',
  authorization(),
  paymentController.getTransaction
);

module.exports = router;
