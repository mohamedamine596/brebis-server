# 🚀 Démarrage Rapide - Brebis Invest Backend

## ✅ Installation terminée !

Votre backend Brebis Invest est prêt à l'emploi ! 🎉

## 📋 Ce qui a été créé

### Structure du projet
```
backend/
├── config/          # Configuration (Database)
├── controllers/     # Logique métier
├── middlewares/     # Auth, validation, erreurs
├── models/          # Modèles MongoDB
├── routes/          # Routes API
├── scripts/         # Scripts utilitaires (seed)
├── postman/         # Collection Postman
├── server.js        # Point d'entrée
├── .env             # Configuration environnement
└── README.md        # Documentation complète
```

### Fonctionnalités implémentées ✅

**Authentification**
- ✅ Inscription utilisateur
- ✅ Connexion avec JWT
- ✅ Gestion de profil
- ✅ Changement de mot de passe

**Gestion des Brebis**
- ✅ Liste des brebis disponibles
- ✅ Détails d'une brebis
- ✅ CRUD complet (Admin)
- ✅ Statistiques

**Système de Paiement**
- ✅ Intégration Stripe Checkout
- ✅ Webhooks pour confirmation
- ✅ Historique des transactions

**Investissements**
- ✅ Création après paiement
- ✅ Liste des investissements
- ✅ Statistiques personnelles
- ✅ Activités récentes

**Administration**
- ✅ Dashboard avec stats globales
- ✅ Gestion des utilisateurs
- ✅ Gestion des brebis
- ✅ Vue des investissements

**Sécurité**
- ✅ Helmet (headers sécurisés)
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ Validation des données
- ✅ Mots de passe cryptés (bcrypt)

## 🎯 Démarrage en 3 étapes

### 1. Le serveur est déjà démarré !

Votre serveur tourne sur: **http://localhost:5000**

Pour le redémarrer plus tard:
```bash
cd backend
npm start
```

Mode développement (auto-reload):
```bash
npm run dev
```

### 2. Base de données initialisée

La base de données MongoDB Atlas est connectée et contient:
- ✅ 1 compte administrateur
- ✅ 2 utilisateurs de test
- ✅ 8 brebis disponibles

### 3. Comptes de test disponibles

**Administrateur:**
- Email: `admin@brebisinvest.fr`
- Mot de passe: `Admin@123456`

**Utilisateurs:**
- Email: `jean.dupont@example.com` | Mot de passe: `password123`
- Email: `marie.martin@example.com` | Mot de passe: `password123`

## 🧪 Tester l'API

### Option 1: Dans le navigateur

Ouvrez ces URLs:
- **API Racine:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health
- **Liste des brebis:** http://localhost:5000/api/brebis

### Option 2: Avec Postman

1. Importez la collection: `postman/Brebis-Invest-API.postman_collection.json`
2. Créez un environnement avec `baseUrl = http://localhost:5000/api`
3. Testez les routes dans cet ordre:
   - Login Admin
   - Get All Brebis
   - Get Dashboard Stats

### Option 3: Avec PowerShell

```powershell
# Test de connexion
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET

# Connexion admin
$body = @{
    email = "admin@brebisinvest.fr"
    password = "Admin@123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.data.token

# Voir son profil
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

## 📡 Endpoints principaux

### Authentification
```
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion
GET    /api/auth/me             # Mon profil (🔒)
PUT    /api/auth/updateProfile  # Modifier profil (🔒)
PUT    /api/auth/updatePassword # Changer mot de passe (🔒)
```

### Brebis
```
GET    /api/brebis              # Liste des brebis
GET    /api/brebis/:id          # Détails d'une brebis
POST   /api/brebis              # Créer une brebis (🔒 Admin)
PUT    /api/brebis/:id          # Modifier une brebis (🔒 Admin)
DELETE /api/brebis/:id          # Supprimer une brebis (🔒 Admin)
```

### Paiement
```
POST   /api/payment/create-checkout-session  # Créer une session Stripe (🔒)
GET    /api/payment/session/:id              # Statut de session (🔒)
GET    /api/payment/transactions             # Mes transactions (🔒)
POST   /api/payment/webhook                  # Webhook Stripe
```

### Investissements
```
GET    /api/investments          # Mes investissements (🔒)
GET    /api/investments/stats    # Mes statistiques (🔒)
GET    /api/investments/activities # Activités récentes (🔒)
GET    /api/investments/:id      # Détails investissement (🔒)
```

### Administration
```
GET    /api/admin/dashboard      # Dashboard (🔒 Admin)
GET    /api/admin/users          # Tous les utilisateurs (🔒 Admin)
GET    /api/admin/users/:id      # Détails utilisateur (🔒 Admin)
PUT    /api/admin/users/:id      # Modifier utilisateur (🔒 Admin)
DELETE /api/admin/users/:id      # Supprimer utilisateur (🔒 Admin)
GET    /api/admin/investments    # Tous les investissements (🔒 Admin)
GET    /api/admin/transactions   # Toutes les transactions (🔒 Admin)
```

🔒 = Authentification requise

## 🔧 Configuration

### Variables d'environnement (.env)

Les variables sont déjà configurées dans `.env`:
- ✅ Port: 5000
- ✅ MongoDB: Votre cluster Atlas
- ✅ JWT Secret: Configuré
- ✅ Stripe: À configurer avec vos clés

### Configurer Stripe (Optionnel pour les tests)

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés de test
3. Mettez à jour dans `.env`:
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
```

## 📚 Documentation

- **README.md** - Documentation complète
- **MONGODB_INSTALLATION.md** - Guide MongoDB
- **TESTING.md** - Guide de test détaillé

## 🎓 Exemples d'utilisation

### Scénario complet: Acheter une brebis

```javascript
// 1. Créer un compte
POST /api/auth/register
{
  "nom": "Alice Dupont",
  "email": "alice@example.com",
  "password": "password123"
}

// 2. Se connecter (récupérer le token)
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "password123"
}

// 3. Voir les brebis disponibles
GET /api/brebis?disponible=true

// 4. Créer une session de paiement
POST /api/payment/create-checkout-session
Authorization: Bearer TOKEN
{
  "brebisId": "ID_DE_LA_BREBIS"
}

// 5. Rediriger vers l'URL Stripe retournée
// Après paiement, le webhook confirme automatiquement

// 6. Voir ses investissements
GET /api/investments
Authorization: Bearer TOKEN
```

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez MongoDB
# Assurez-vous que .env existe
# Réinstallez les dépendances
npm install
```

### Erreur de connexion MongoDB
- Vérifiez que l'URL MongoDB dans `.env` est correcte
- Vérifiez votre connexion Internet
- Vérifiez que votre IP est autorisée sur MongoDB Atlas

### Erreur 401 (Non autorisé)
- Vérifiez que vous avez bien un token
- Le token doit être dans le header: `Authorization: Bearer TOKEN`

## 🚢 Prochaines étapes

### Pour la production

1. **Sécurité**
   - Changez JWT_SECRET
   - Changez le mot de passe admin
   - Configurez HTTPS
   - Restreignez CORS

2. **MongoDB**
   - Utilisez un cluster payant pour les performances
   - Configurez les backups automatiques
   - Ajoutez des index supplémentaires

3. **Stripe**
   - Passez aux clés de production
   - Configurez les webhooks en production
   - Testez les paiements réels

4. **Déploiement**
   - Hébergez sur Heroku, DigitalOcean ou AWS
   - Configurez un nom de domaine
   - Ajoutez un certificat SSL

### Pour le développement

- Créez le frontend (React, Vue, Angular)
- Ajoutez plus de tests automatisés
- Implémentez des notifications par email
- Ajoutez l'upload d'images pour les brebis
- Créez des rapports PDF pour les investisseurs

## 📞 Support

**Documentation:**
- README.md pour les détails complets
- TESTING.md pour les tests
- MONGODB_INSTALLATION.md pour MongoDB

**Fichiers de configuration:**
- `.env` - Variables d'environnement
- `package.json` - Dépendances
- `postman/` - Collection API

## ✨ Félicitations !

Votre backend Brebis Invest est opérationnel ! 🎉

Le serveur est en cours d'exécution et prêt à recevoir des requêtes.
Vous pouvez maintenant :
- Tester l'API avec Postman
- Créer un frontend
- Déployer en production

**Bon développement ! 🚀**
