const Investment = require('../models/Investment');
const User = require('../models/User');
const Brebis = require('../models/Brebis');

// @desc    Obtenir tous les investissements de l'utilisateur
// @route   GET /api/investments
// @access  Private
exports.getMyInvestments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;

    const query = { user: req.user.id };
    if (statut) {
      query.statut = statut;
    }

    const investments = await Investment.find(query)
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

// @desc    Obtenir un investissement par ID
// @route   GET /api/investments/:id
// @access  Private
exports.getInvestmentById = async (req, res, next) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('brebis')
      .populate('transaction')
      .populate('user', 'nom email');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investissement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (investment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à cet investissement'
      });
    }

    res.status(200).json({
      success: true,
      data: { investment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des investissements
// @route   GET /api/investments/stats
// @access  Private
exports.getInvestmentStats = async (req, res, next) => {
  try {
    const stats = await Investment.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalInvestissements: { $sum: 1 },
          montantTotal: { $sum: '$montant' },
          gainsTotal: { $sum: '$gains' },
          investissementsActifs: {
            $sum: { $cond: ['$actif', 1, 0] }
          }
        }
      }
    ]);

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        nombreBrebis: user.nombreBrebis,
        montantTotalInvesti: user.montantTotalInvesti,
        ...(stats[0] || {
          totalInvestissements: 0,
          montantTotal: 0,
          gainsTotal: 0,
          investissementsActifs: 0
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les dernières activités
// @route   GET /api/investments/activities
// @access  Private
exports.getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const activities = await Investment.find({ user: req.user.id })
      .populate('brebis', 'nom image')
      .select('brebis montant dateInvestissement statut')
      .sort('-dateInvestissement')
      .limit(limit * 1);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};
