const express = require('express');
const { body } = require('express-validator');
const {
  createPaymentIntent,
  confirmPayment,
  createCheckoutSession,
  stripeWebhook,
  getSessionStatus,
  getTransactions
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Validation pour créer une session de paiement
const checkoutValidation = [
  body('brebisId')
    .notEmpty()
    .withMessage("L'ID de la brebis est requis")
    .isMongoId()
    .withMessage('ID de brebis invalide')
];

// Validation pour Payment Intent
const paymentIntentValidation = [
  body('investmentId')
    .notEmpty()
    .withMessage("L'ID de l'investissement est requis")
    .isMongoId()
    .withMessage('ID d\'investissement invalide')
];

const confirmPaymentValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage("L'ID du Payment Intent est requis"),
  body('investmentId')
    .notEmpty()
    .withMessage("L'ID de l'investissement est requis")
    .isMongoId()
    .withMessage('ID d\'investissement invalide')
];

// Routes Payment Intent (Phase 2)
router.post('/create-payment-intent', protect, paymentIntentValidation, validate, createPaymentIntent);
router.post('/confirm', protect, confirmPaymentValidation, validate, confirmPayment);

// Routes Legacy Checkout (Phase 1)
router.post('/create-checkout-session', protect, checkoutValidation, validate, createCheckoutSession);
router.get('/session/:sessionId', protect, getSessionStatus);
router.get('/transactions', protect, getTransactions);

// Webhook Stripe (doit être avant express.json() dans server.js)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
