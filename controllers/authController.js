const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { nom, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      email,
      password
    });

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          nombreBrebis: user.nombreBrebis,
          montantTotalInvesti: user.montantTotalInvesti
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Hardcoded Super Admin - Cannot be modified except by touching the code
    const SUPER_ADMIN_EMAIL = 'superadmin@brebisinvest.fr';
    const SUPER_ADMIN_PASSWORD = 'SuperAdmin@2025!';
    
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      const { generateToken } = require('../middlewares/auth');
      const token = generateToken('superadmin');
      
      return res.status(200).json({
        success: true,
        message: 'Connexion super admin réussie',
        data: {
          user: {
            id: 'superadmin',
            nom: 'Super Administrator',
            email: SUPER_ADMIN_EMAIL,
            role: 'admin',
            nombreBrebis: 0,
            montantTotalInvesti: 0
          },
          token
        }
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          nombreBrebis: user.nombreBrebis,
          montantTotalInvesti: user.montantTotalInvesti
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir le profil utilisateur
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('investissements')
      .select('-password');

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: user.getStats()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/updateProfile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      nom: req.body.nom,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/updatePassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Vérifier l'ancien mot de passe
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Définir le nouveau mot de passe
    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};
