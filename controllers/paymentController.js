const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Brebis = require('../models/Brebis');
const User = require('../models/User');

// @desc    Créer une session de paiement Stripe
// @route   POST /api/payment/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { brebisId } = req.body;

    // Vérifier que la brebis existe et est disponible
    const brebis = await Brebis.findById(brebisId);

    if (!brebis) {
      return res.status(404).json({
        success: false,
        message: 'Brebis non trouvée'
      });
    }

    if (!brebis.disponible || brebis.vendue) {
      return res.status(400).json({
        success: false,
        message: 'Cette brebis n\'est plus disponible'
      });
    }

    // Créer une transaction en attente
    const transaction = await Transaction.create({
      user: req.user.id,
      montant: brebis.prix,
      type: 'achat',
      statut: 'en_attente',
      methodePaiement: 'stripe',
      description: `Achat de la brebis ${brebis.nom}`,
      metadata: {
        brebisId: brebis._id.toString(),
        brebisNom: brebis.nom
      }
    });

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: brebis.nom,
              description: brebis.description,
              images: brebis.image ? [`${process.env.FRONTEND_URL}/images/${brebis.image}`] : []
            },
            unit_amount: Math.round(brebis.prix * 100) // Convertir en centimes
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      client_reference_id: req.user.id,
      metadata: {
        transactionId: transaction._id.toString(),
        brebisId: brebis._id.toString(),
        userId: req.user.id
      }
    });

    // Mettre à jour la transaction avec l'ID de session
    transaction.stripeSessionId = session.id;
    await transaction.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook Stripe pour confirmer les paiements
// @route   POST /api/payment/webhook
// @access  Public (mais sécurisé par signature Stripe)
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Récupérer la transaction
      const transaction = await Transaction.findOne({
        stripeSessionId: session.id
      });

      if (!transaction) {
        console.log('Transaction non trouvée pour la session:', session.id);
        return res.status(404).json({ received: false });
      }

      // Mettre à jour le statut de la transaction
      transaction.statut = 'reussie';
      transaction.stripePaymentIntentId = session.payment_intent;
      await transaction.save();

      // Récupérer la brebis
      const brebisId = session.metadata.brebisId;
      const brebis = await Brebis.findById(brebisId);

      if (!brebis) {
        console.log('Brebis non trouvée:', brebisId);
        return res.status(404).json({ received: false });
      }

      // Marquer la brebis comme vendue
      await brebis.marquerVendue(transaction.user);

      // Créer l'investissement
      const investment = await Investment.create({
        user: transaction.user,
        brebis: brebis._id,
        montant: transaction.montant,
        statut: 'confirme',
        transaction: transaction._id
      });

      // Mettre à jour l'utilisateur
      const user = await User.findById(transaction.user);
      user.investissements.push(investment._id);
      user.nombreBrebis += 1;
      user.montantTotalInvesti += transaction.montant;
      await user.save();

      // Mettre à jour la transaction avec l'investissement
      transaction.investment = investment._id;
      await transaction.save();

      console.log('✅ Paiement confirmé et investissement créé');
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
    }
  }

  res.json({ received: true });
};

// @desc    Vérifier le statut d'une session de paiement
// @route   GET /api/payment/session/:sessionId
// @access  Private
exports.getSessionStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const transaction = await Transaction.findOne({
      stripeSessionId: sessionId,
      user: req.user.id
    }).populate('investment');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: session.payment_status,
        transaction,
        session: {
          id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          status: session.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'historique des transactions
// @route   GET /api/payment/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const transactions = await Transaction.find({ user: req.user.id })
      .populate('investment')
      .sort('-dateTransaction')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Transaction.countDocuments({ user: req.user.id });

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
