const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAllInvestments,
  getAllTransactions
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes sont protégées et réservées aux admins
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Gestion des utilisateurs
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Gestion des investissements
router.get('/investments', getAllInvestments);

// Gestion des transactions
router.get('/transactions', getAllTransactions);

module.exports = router;
