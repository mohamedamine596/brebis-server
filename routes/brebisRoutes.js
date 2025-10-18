const express = require('express');
const { body } = require('express-validator');
const {
  getAllBrebis,
  getBrebisById,
  createBrebis,
  updateBrebis,
  deleteBrebis,
  getBrebisStats
} = require('../controllers/brebisController');
const { protect, admin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { uploadSingle, handleMulterError } = require('../middlewares/upload');

const router = express.Router();

// Validation pour la création/mise à jour de brebis
const brebisValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom de la brebis est requis')
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est requise')
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('prix')
    .notEmpty()
    .withMessage('Le prix est requis')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  body('age')
    .optional()
    .isInt({ min: 0 })
    .withMessage("L'âge doit être un nombre entier positif"),
  body('race')
    .optional()
    .trim(),
  body('image')
    .optional()
    .trim()
];

// Routes publiques
router.get('/', getAllBrebis);
router.get('/:id', getBrebisById);

// Routes protégées admin
router.get('/admin/stats', protect, admin, getBrebisStats);
router.post('/', protect, admin, uploadSingle, handleMulterError, createBrebis);
router.put('/:id', protect, admin, uploadSingle, handleMulterError, updateBrebis);
router.delete('/:id', protect, admin, deleteBrebis);

module.exports = router;
