const Brebis = require('../models/Brebis');

// @desc    Obtenir toutes les brebis disponibles
// @route   GET /api/brebis
// @access  Public
exports.getAllBrebis = async (req, res, next) => {
  try {
    const { disponible, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};
    if (disponible !== undefined) {
      query.disponible = disponible === 'true';
    }

    const brebis = await Brebis.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Brebis.countDocuments(query);

    res.status(200).json({
      success: true,
      count: brebis.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { brebis }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une brebis par ID
// @route   GET /api/brebis/:id
// @access  Public
exports.getBrebisById = async (req, res, next) => {
  try {
    const brebis = await Brebis.findById(req.params.id);

    if (!brebis) {
      return res.status(404).json({
        success: false,
        message: 'Brebis non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: { brebis }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer une nouvelle brebis
// @route   POST /api/brebis
// @access  Private/Admin
exports.createBrebis = async (req, res, next) => {
  try {
    // Extract form data
    const brebisData = {
      nom: req.body.nom,
      description: req.body.description,
      prix: parseFloat(req.body.prix),
      age: req.body.age ? parseInt(req.body.age) : undefined,
      race: req.body.race || undefined,
    };

    // Handle image upload
    if (req.file) {
      brebisData.image = req.file.filename; // Store only filename, not full path
    }

    // Validate required fields
    if (!brebisData.nom || !brebisData.description || !brebisData.prix) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, description et prix sont requis'
      });
    }

    const brebis = await Brebis.create(brebisData);

    res.status(201).json({
      success: true,
      message: 'Brebis créée avec succès',
      data: { brebis }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une brebis
// @route   PUT /api/brebis/:id
// @access  Private/Admin
exports.updateBrebis = async (req, res, next) => {
  try {
    // Find existing brebis
    const existingBrebis = await Brebis.findById(req.params.id);
    
    if (!existingBrebis) {
      return res.status(404).json({
        success: false,
        message: 'Brebis non trouvée'
      });
    }

    // Extract form data
    const updateData = {};
    
    if (req.body.nom) updateData.nom = req.body.nom;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.prix) updateData.prix = parseFloat(req.body.prix);
    if (req.body.age) updateData.age = parseInt(req.body.age);
    if (req.body.race) updateData.race = req.body.race;
    if (req.body.disponible !== undefined) updateData.disponible = req.body.disponible === 'true';

    // Handle image upload
    if (req.file) {
      updateData.image = req.file.filename;
      
      // TODO: Delete old image file if it exists
      // const fs = require('fs');
      // const path = require('path');
      // if (existingBrebis.image && existingBrebis.image !== 'default-brebis.jpg') {
      //   const oldImagePath = path.join(__dirname, '../uploads', existingBrebis.image);
      //   if (fs.existsSync(oldImagePath)) {
      //     fs.unlinkSync(oldImagePath);
      //   }
      // }
    }

    const brebis = await Brebis.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Brebis mise à jour avec succès',
      data: { brebis }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une brebis
// @route   DELETE /api/brebis/:id
// @access  Private/Admin
exports.deleteBrebis = async (req, res, next) => {
  try {
    const brebis = await Brebis.findById(req.params.id);

    if (!brebis) {
      return res.status(404).json({
        success: false,
        message: 'Brebis non trouvée'
      });
    }

    // Vérifier si la brebis n'est pas déjà vendue
    if (brebis.vendue) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une brebis déjà vendue'
      });
    }

    await brebis.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Brebis supprimée avec succès',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des brebis
// @route   GET /api/brebis/stats
// @access  Private/Admin
exports.getBrebisStats = async (req, res, next) => {
  try {
    const stats = await Brebis.aggregate([
      {
        $group: {
          _id: null,
          totalBrebis: { $sum: 1 },
          disponibles: {
            $sum: { $cond: ['$disponible', 1, 0] }
          },
          vendues: {
            $sum: { $cond: ['$vendue', 1, 0] }
          },
          prixMoyen: { $avg: '$prix' },
          prixMin: { $min: '$prix' },
          prixMax: { $max: '$prix' },
          valeurTotale: { $sum: '$prix' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalBrebis: 0,
        disponibles: 0,
        vendues: 0,
        prixMoyen: 0,
        prixMin: 0,
        prixMax: 0,
        valeurTotale: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
