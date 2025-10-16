const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brebis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brebis',
    required: true
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirme', 'annule'],
    default: 'en_attente'
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  dateInvestissement: {
    type: Date,
    default: Date.now
  },
  gains: {
    type: Number,
    default: 0
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
investmentSchema.index({ user: 1, dateInvestissement: -1 });
investmentSchema.index({ brebis: 1 });

module.exports = mongoose.model('Investment', investmentSchema);
