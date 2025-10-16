const mongoose = require('mongoose');

const brebisSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la brebis est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  image: {
    type: String,
    default: 'default-brebis.jpg'
  },
  age: {
    type: Number,
    min: [0, "L'âge ne peut pas être négatif"]
  },
  race: {
    type: String,
    trim: true
  },
  disponible: {
    type: Boolean,
    default: true
  },
  vendue: {
    type: Boolean,
    default: false
  },
  achetePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dateAchat: {
    type: Date,
    default: null
  },
  caracteristiques: {
    poids: Number,
    sante: {
      type: String,
      enum: ['Excellente', 'Bonne', 'Moyenne'],
      default: 'Bonne'
    },
    reproduction: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
brebisSchema.index({ disponible: 1, vendue: 1 });
brebisSchema.index({ prix: 1 });

// Méthode pour marquer comme vendue
brebisSchema.methods.marquerVendue = function(userId) {
  this.vendue = true;
  this.disponible = false;
  this.achetePar = userId;
  this.dateAchat = new Date();
  return this.save();
};

module.exports = mongoose.model('Brebis', brebisSchema);
