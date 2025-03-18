const router = require('express').Router();
const { refreshToken } = require('../../controllers/authController');
const paymentRoute = require('../../routes/user/paymentRoutes');

router.post('/refreshToken', refreshToken);

router.use(paymentRoute);

module.exports = router;
