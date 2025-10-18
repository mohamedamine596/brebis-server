require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Initialiser Express
const app = express();

// Connecter à la base de données
connectDB();

// Trust proxy (important pour rate limiting derrière un proxy)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Appliquer le rate limiting à toutes les routes
app.use('/api/', limiter);

// Rate limiting plus strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increased from 5 to 50 for development
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
});

// Webhooks Stripe - doit être avant express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers with relaxed CSP for images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3000", "http://localhost:5000"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logger (en développement)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (uploaded images) with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  // Set explicit CORS headers for image requests
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static('uploads'));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/brebis', require('./routes/brebisRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenue sur l\'API Brebis Invest 🐑',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      brebis: '/api/brebis',
      payment: '/api/payment',
      investments: '/api/investments',
      admin: '/api/admin'
    }
  });
});

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Brebis Invest fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Error handler (doit être en dernier)
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Gérer les erreurs non gérées
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Erreur: ${err.message}`);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});

module.exports = app;
