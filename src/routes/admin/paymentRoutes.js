'use strict';

const router = require('express').Router();
const { authorization } = require('../../middlewares/authMiddlewares');
const paymentController = require('../../controllers/admin/paymentController');

router.get('/all', authorization(true), paymentController.getPaymentsAll);

router.get(
  '/allTransactions',
  authorization(true),
  paymentController.getTransactionsAll
);

module.exports = router;
