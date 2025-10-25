# 🐑 Brebis Invest - Backend API

Backend Node.js/Express pour la plateforme d'investissement Brebis Invest.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Documentation](#api-documentation)
- [Structure du projet](#structure-du-projet)
- [Tests](#tests)
- [Sécurité](#sécurité)

## ✨ Fonctionnalités

### Authentification
- ✅ Inscription et connexion utilisateur
- ✅ JWT pour l'authentification
- ✅ Mots de passe cryptés avec bcrypt
- ✅ Gestion de profil utilisateur
- ✅ Changement de mot de passe

### Gestion des Brebis
- ✅ Liste des brebis disponibles
- ✅ Détails d'une brebis
- ✅ CRUD complet (Admin uniquement)
- ✅ Statistiques des brebis

### Système de Paiement
- ✅ Intégration Stripe Checkout
- ✅ Webhook pour confirmation de paiement
- ✅ Historique des transactions
- ✅ Vérification du statut de paiement

### Investissements
- ✅ Création d'investissement après paiement
- ✅ Liste des investissements utilisateur
- ✅ Statistiques d'investissement
- ✅ Activités récentes

### Espace Administrateur
- ✅ Dashboard avec statistiques globales
- ✅ Gestion des utilisateurs
- ✅ Vue d'ensemble des investissements
- ✅ Gestion des transactions

## 🛠 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **Bcrypt.js** - Cryptage des mots de passe
- **Stripe** - Traitement des paiements
- **Express Validator** - Validation des données
- **Helmet** - Sécurité HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limit** - Protection contre les abus
- **Morgan** - Logger HTTP

## 📦 Prérequis

- Node.js (v16 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- Compte Stripe (pour les paiements)
- npm ou yarn

## 🚀 Installation

1. **Cloner le repository**
```bash
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer MongoDB**

Assurez-vous que MongoDB est installé et en cours d'exécution sur votre machine.

Pour démarrer MongoDB localement:
```bash
mongod
```

## ⚙️ Configuration

1. **Créer le fichier .env**

Copiez le fichier `.env.example` et renommez-le en `.env`:
```bash
copy .env.example .env
```

2. **Configurer les variables d'environnement**

Éditez le fichier `.env` et configurez les variables:

```env
# Configuration du serveur
NODE_ENV=development
PORT=5000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/brebis-invest

# JWT Secret (générez une clé sécurisée)
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
JWT_EXPIRE=30d

# Stripe (obtenez vos clés sur https://stripe.com)
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# URL du frontend
FRONTEND_URL=http://brebis-server-1.vercel.app

# Admin par défaut
ADMIN_EMAIL=admin@brebisinvest.fr
ADMIN_PASSWORD=Admin@123456
```

3. **Obtenir les clés Stripe**

- Créez un compte sur [Stripe](https://stripe.com)
- Récupérez vos clés API dans Dashboard > Developers > API keys
- Configurez un webhook pour recevoir les événements de paiement

## 🎬 Démarrage

### 1. Initialiser la base de données avec des données de test

```bash
node scripts/seedData.js
```

Cela créera:
- Un compte administrateur
- 2 utilisateurs de test
- 8 brebis de test

### 2. Démarrer le serveur

**Mode développement (avec auto-reload):**
```bash
npm run dev
```

**Mode production:**
```bash
npm start
```

Le serveur démarrera sur `http://localhost:5000`

### 3. Vérifier le bon fonctionnement

Ouvrez votre navigateur et accédez à:
```
http://localhost:5000/api/health
```

Vous devriez voir:
```json
{
  "success": true,
  "message": "API Brebis Invest fonctionne correctement",
  "timestamp": "2025-10-16T..."
}
```

## 📚 API Documentation

### Authentication

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "password123"
}
```

#### Obtenir le profil
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Brebis

#### Liste des brebis
```http
GET /api/brebis?page=1&limit=10&disponible=true
```

#### Détails d'une brebis
```http
GET /api/brebis/:id
```

#### Créer une brebis (Admin)
```http
POST /api/brebis
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "nom": "Bella",
  "description": "Brebis Mérinos",
  "prix": 150,
  "age": 2,
  "race": "Mérinos",
  "disponible": true
}
```

### Paiement

#### Créer une session de paiement
```http
POST /api/payment/create-checkout-session
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "brebisId": "65f..."
}
```

#### Vérifier le statut d'une session
```http
GET /api/payment/session/:sessionId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Historique des transactions
```http
GET /api/payment/transactions?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### Investissements

#### Mes investissements
```http
GET /api/investments
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Statistiques d'investissement
```http
GET /api/investments/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Activités récentes
```http
GET /api/investments/activities?limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

### Administration

#### Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Liste des utilisateurs
```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Tous les investissements
```http
GET /api/admin/investments
Authorization: Bearer ADMIN_JWT_TOKEN
```

## 📁 Structure du projet

```
backend/
├── config/
│   └── database.js          # Configuration MongoDB
├── controllers/
│   ├── adminController.js   # Logique admin
│   ├── authController.js    # Logique authentification
│   ├── brebisController.js  # Logique brebis
│   ├── investmentController.js
│   └── paymentController.js # Logique paiement Stripe
├── middlewares/
│   ├── auth.js             # Middleware JWT & autorisation
│   ├── errorHandler.js     # Gestionnaire d'erreurs
│   └── validate.js         # Validation des données
├── models/
│   ├── Brebis.js          # Modèle Brebis
│   ├── Investment.js      # Modèle Investissement
│   ├── Transaction.js     # Modèle Transaction
│   └── User.js            # Modèle Utilisateur
├── routes/
│   ├── adminRoutes.js     # Routes admin
│   ├── authRoutes.js      # Routes auth
│   ├── brebisRoutes.js    # Routes brebis
│   ├── investmentRoutes.js
│   └── paymentRoutes.js   # Routes paiement
├── scripts/
│   └── seedData.js        # Script d'initialisation
├── .env.example           # Exemple de configuration
├── .gitignore
├── package.json
├── README.md
└── server.js              # Point d'entrée
```

## 🧪 Tests

### Tester avec Postman

1. Importez la collection Postman (à venir)
2. Configurez les variables d'environnement
3. Lancez les tests

### Tests unitaires

```bash
npm test
```

## 🔒 Sécurité

Le backend implémente plusieurs mesures de sécurité:

- ✅ **Helmet** - Protection des headers HTTP
- ✅ **CORS** - Contrôle d'accès cross-origin
- ✅ **Rate Limiting** - Protection contre les abus
- ✅ **JWT** - Authentification sécurisée
- ✅ **Bcrypt** - Cryptage des mots de passe
- ✅ **Validation des données** - Express Validator
- ✅ **MongoDB Injection** - Protection Mongoose
- ✅ **HTTPS** - Recommandé en production

## 🔑 Comptes par défaut

Après avoir exécuté le script `seedData.js`:

**Administrateur:**
- Email: `admin@brebisinvest.fr`
- Mot de passe: `Admin@123456`

**Utilisateurs de test:**
- Email: `jean.dupont@example.com` | Mot de passe: `password123`
- Email: `marie.martin@example.com` | Mot de passe: `password123`

⚠️ **Important:** Changez le mot de passe admin en production!

## 📝 Variables d'environnement importantes

| Variable | Description | Exemple |
|----------|-------------|---------|
| NODE_ENV | Environnement | development/production |
| PORT | Port du serveur | 5000 |
| MONGODB_URI | URL MongoDB | mongodb://localhost:27017/brebis-invest |
| JWT_SECRET | Secret pour JWT | changez_moi_en_production |
| STRIPE_SECRET_KEY | Clé secrète Stripe | sk_test_... |
| STRIPE_WEBHOOK_SECRET | Secret webhook Stripe | whsec_... |
| FRONTEND_URL | URL du frontend | http://brebis-server-1.vercel.app |

## 🚀 Déploiement

### Prérequis pour la production

1. Configurez `NODE_ENV=production`
2. Utilisez une base MongoDB cloud (MongoDB Atlas)
3. Configurez les clés Stripe en mode production
4. Activez HTTPS/SSL
5. Configurez les webhooks Stripe

### Services recommandés

- **Hébergement:** Heroku, DigitalOcean, AWS
- **Base de données:** MongoDB Atlas
- **Paiements:** Stripe

## 🐛 Dépannage

### MongoDB ne se connecte pas
```bash
# Vérifiez que MongoDB est en cours d'exécution
mongod --version

# Démarrez MongoDB
mongod
```

### Erreur Stripe
- Vérifiez vos clés API Stripe
- Assurez-vous que les webhooks sont configurés

### Port déjà utilisé
```bash
# Changez le port dans .env
PORT=5001
```

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

## 📄 Licence

ISC

---

**Développé avec ❤️ pour Brebis Invest**
