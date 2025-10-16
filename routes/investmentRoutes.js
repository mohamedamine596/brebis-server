const express = require('express');
const {
  getMyInvestments,
  getInvestmentById,
  getInvestmentStats,
  getRecentActivities
} = require('../controllers/investmentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

router.get('/', getMyInvestments);
router.get('/stats', getInvestmentStats);
router.get('/activities', getRecentActivities);
router.get('/:id', getInvestmentById);

module.exports = router;
