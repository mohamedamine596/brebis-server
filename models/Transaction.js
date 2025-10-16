const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  type: {
    type: String,
    enum: ['achat', 'gain', 'retrait'],
    default: 'achat'
  },
  statut: {
    type: String,
    enum: ['en_attente', 'reussie', 'echouee', 'remboursee'],
    default: 'en_attente'
  },
  methodePaiement: {
    type: String,
    enum: ['stripe', 'paypal', 'virement'],
    default: 'stripe'
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: String
  },
  dateTransaction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
transactionSchema.index({ user: 1, dateTransaction: -1 });
transactionSchema.index({ statut: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
