const express = require('express');
const { body } = require('express-validator');
const {
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

// Routes protégées
router.post('/create-checkout-session', protect, checkoutValidation, validate, createCheckoutSession);
router.get('/session/:sessionId', protect, getSessionStatus);
router.get('/transactions', protect, getTransactions);

// Webhook Stripe (doit être avant express.json() dans server.js)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
