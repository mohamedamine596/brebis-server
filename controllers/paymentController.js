const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Brebis = require('../models/Brebis');
const User = require('../models/User');

// @desc    Créer un Payment Intent pour un investissement
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { investmentId } = req.body;

    if (!investmentId) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'investissement requis'
      });
    }

    // Récupérer l'investissement
    const investment = await Investment.findById(investmentId)
      .populate('brebis')
      .populate('user');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investissement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'investissement
    if (investment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cet investissement'
      });
    }

    // Vérifier que l'investissement est en attente
    if (investment.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cet investissement ne peut plus être payé'
      });
    }

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(investment.montant * 100), // Convertir en centimes
      currency: 'eur',
      metadata: {
        investmentId: investment._id.toString(),
        userId: req.user.id,
        brebisId: investment.brebis._id.toString(),
        brebisNom: investment.brebis.nom
      }
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Confirmer le paiement et finaliser l'investissement
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, investmentId } = req.body;
    console.log('Confirm payment request:', { paymentIntentId, investmentId, userId: req.user.id });

    if (!paymentIntentId || !investmentId) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'ID de paiement et d\'investissement requis'
      });
    }

    // Récupérer le Payment Intent depuis Stripe
    console.log('Retrieving payment intent from Stripe...');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      console.log('Payment not succeeded:', paymentIntent.status);
      return res.status(400).json({
        success: false,
        message: 'Le paiement n\'a pas été complété'
      });
    }

    // Récupérer l'investissement
    console.log('Finding investment...');
    const investment = await Investment.findById(investmentId)
      .populate('brebis')
      .populate('user');

    if (!investment) {
      console.log('Investment not found');
      return res.status(404).json({
        success: false,
        message: 'Investissement non trouvé'
      });
    }

    console.log('Investment found:', { 
      id: investment._id, 
      userId: investment.user._id.toString(), 
      requestUserId: req.user.id,
      status: investment.statut 
    });

    // Vérifier que l'utilisateur est le propriétaire
    if (investment.user._id.toString() !== req.user.id) {
      console.log('User mismatch');
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    console.log('Creating transaction...');
    // Créer la transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      montant: investment.montant,
      type: 'achat',
      statut: 'complete',
      stripePaymentIntentId: paymentIntentId,
      description: `Paiement pour investissement dans ${investment.brebis.nom}`
    });
    console.log('Transaction created:', transaction._id);

    console.log('Updating investment...');
    // Mettre à jour l'investissement
    investment.statut = 'confirme';
    investment.transaction = transaction._id;
    await investment.save();
    console.log('Investment updated to confirmed');

    console.log('Updating brebis...');
    // Marquer la brebis comme vendue
    await Brebis.findByIdAndUpdate(investment.brebis._id, {
      disponible: false,
      vendue: true,
      achetePar: req.user.id,
      dateAchat: new Date()
    });
    console.log('Brebis marked as sold');

    console.log('Updating user stats...');
    // Mettre à jour les statistiques de l'utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        nombreBrebis: 1,
        montantTotalInvesti: investment.montant
      },
      $push: {
        investissements: investment._id
      }
    });
    console.log('User stats updated');

    console.log('Payment confirmation successful');
    res.status(200).json({
      success: true,
      message: 'Paiement confirmé et investissement finalisé',
      data: {
        success: true,
        paymentIntentId,
        investmentId,
        message: 'Investissement confirmé avec succès'
      }
    });

  } catch (error) {
    console.error('Error in confirmPayment:', error);
    next(error);
  }
};

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
