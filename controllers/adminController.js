const User = require('../models/User');
const Investment = require('../models/Investment');
const Brebis = require('../models/Brebis');
const Transaction = require('../models/Transaction');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('investissements');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les statistiques de l'utilisateur
    const investments = await Investment.find({ user: user._id })
      .populate('brebis');

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: user.getStats(),
        investments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { nom, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, email, role, isActive },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ne pas supprimer un admin
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un administrateur'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques du dashboard admin
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Statistiques utilisateurs
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Statistiques brebis
    const totalBrebis = await Brebis.countDocuments();
    const brebisDisponibles = await Brebis.countDocuments({ disponible: true });
    const brebisVendues = await Brebis.countDocuments({ vendue: true });

    // Statistiques investissements
    const totalInvestissements = await Investment.countDocuments();
    const investissementsConfirmes = await Investment.countDocuments({ statut: 'confirme' });

    // Statistiques financières
    const financialStats = await Transaction.aggregate([
      { $match: { statut: 'reussie' } },
      {
        $group: {
          _id: null,
          revenuTotal: { $sum: '$montant' },
          nombreTransactions: { $sum: 1 }
        }
      }
    ]);

    // Récupérer les derniers utilisateurs
    const recentUsers = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(5);

    // Récupérer les dernières transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'nom email')
      .sort('-dateTransaction')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers
        },
        brebis: {
          total: totalBrebis,
          disponibles: brebisDisponibles,
          vendues: brebisVendues
        },
        investissements: {
          total: totalInvestissements,
          confirmes: investissementsConfirmes
        },
        finances: {
          revenuTotal: financialStats[0]?.revenuTotal || 0,
          nombreTransactions: financialStats[0]?.nombreTransactions || 0
        },
        recentUsers,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les investissements (Admin)
// @route   GET /api/admin/investments
// @access  Private/Admin
exports.getAllInvestments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;

    const query = {};
    if (statut) query.statut = statut;

    const investments = await Investment.find(query)
      .populate('user', 'nom email')
      .populate('brebis')
      .populate('transaction')
      .sort('-dateInvestissement')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Investment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: investments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { investments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les transactions (Admin)
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut, type } = req.query;

    const query = {};
    if (statut) query.statut = statut;
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('user', 'nom email')
      .populate('investment')
      .sort('-dateTransaction')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};
