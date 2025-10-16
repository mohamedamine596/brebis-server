# 🧪 Guide de Test de l'API Brebis Invest

## 🚀 Démarrage rapide

### 1. Vérifier que le serveur fonctionne

**URL:** `http://localhost:5000`

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Bienvenue sur l'API Brebis Invest 🐑",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "brebis": "/api/brebis",
    "payment": "/api/payment",
    "investments": "/api/investments",
    "admin": "/api/admin"
  }
}
```

### 2. Health Check

**URL:** `http://localhost:5000/api/health`

**Réponse attendue:**
```json
{
  "success": true,
  "message": "API Brebis Invest fonctionne correctement",
  "timestamp": "2025-10-16T..."
}
```

## 📝 Tests manuels avec cURL ou Postman

### Étape 1: Inscription d'un utilisateur

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Réponse attendue:** Token JWT + informations utilisateur

**Sauvegardez le token** pour les requêtes suivantes !

### Étape 2: Connexion

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@brebisinvest.fr\",\"password\":\"Admin@123456\"}"
```

**Pour PowerShell:**
```powershell
$body = @{
    email = "admin@brebisinvest.fr"
    password = "Admin@123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Étape 3: Obtenir la liste des brebis

```bash
curl http://localhost:5000/api/brebis
```

**Pour PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/brebis" -Method GET
```

### Étape 4: Obtenir mon profil (avec authentification)

Remplacez `YOUR_TOKEN` par le token obtenu lors de la connexion.

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Pour PowerShell:**
```powershell
$token = "VOTRE_TOKEN_ICI"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

### Étape 5: Créer une brebis (Admin uniquement)

```bash
curl -X POST http://localhost:5000/api/brebis \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Nouvelle Brebis\",\"description\":\"Description test\",\"prix\":150,\"age\":2,\"race\":\"Mérinos\"}"
```

**Pour PowerShell:**
```powershell
$adminToken = "VOTRE_ADMIN_TOKEN"
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
$body = @{
    nom = "Nouvelle Brebis"
    description = "Description test"
    prix = 150
    age = 2
    race = "Mérinos"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/brebis" -Method POST -Headers $headers -Body $body
```

## 🎯 Test complet avec Postman

### Importer la collection

1. Ouvrez Postman
2. Cliquez sur "Import"
3. Sélectionnez le fichier `postman/Brebis-Invest-API.postman_collection.json`
4. La collection complète sera importée avec tous les endpoints

### Variables d'environnement Postman

Créez un environnement dans Postman avec ces variables :

| Variable | Valeur |
|----------|--------|
| baseUrl | http://localhost:5000/api |
| token | (sera rempli automatiquement après login) |
| adminToken | (sera rempli automatiquement après login admin) |
| brebisId | (sera rempli automatiquement) |

### Ordre des tests recommandé

1. **Health Check** - Vérifier que l'API fonctionne
2. **Login Admin** - Se connecter en tant qu'admin
3. **Get All Brebis** - Voir les brebis disponibles
4. **Create Brebis** - Créer une nouvelle brebis (admin)
5. **Register User** - Créer un nouveau compte utilisateur
6. **Login User** - Se connecter avec le compte créé
7. **Get My Profile** - Voir son profil
8. **Create Checkout Session** - Créer une session de paiement
9. **Get My Investments** - Voir ses investissements
10. **Get Dashboard Stats (Admin)** - Voir les statistiques

## 🧩 Scénario de test complet

### Scénario: Un utilisateur achète une brebis

1. **Créer un compte**
   - POST `/api/auth/register`
   - Sauvegarder le token

2. **Voir les brebis disponibles**
   - GET `/api/brebis?disponible=true`
   - Noter l'ID d'une brebis

3. **Créer une session de paiement**
   - POST `/api/payment/create-checkout-session`
   - Body: `{ "brebisId": "ID_DE_LA_BREBIS" }`
   - Sauvegarder `sessionId` et `url`

4. **Simuler le paiement**
   - En production: Ouvrir l'URL Stripe et payer
   - En test: Le webhook ne fonctionnera pas localement sans ngrok

5. **Vérifier l'investissement**
   - GET `/api/investments`
   - Devrait afficher l'investissement après paiement réussi

6. **Voir les statistiques**
   - GET `/api/investments/stats`

## 🔧 Tests avec Bruno (Alternative à Postman)

Si vous préférez Bruno (open source):

### Installation
```bash
npm install -g @usebruno/cli
```

### Collection Bruno

Créez un dossier `bruno` et ajoutez vos requêtes :

```
bruno/
├── Auth/
│   ├── register.bru
│   ├── login.bru
│   └── me.bru
├── Brebis/
│   ├── list.bru
│   └── create.bru
└── bruno.json
```

## 🐛 Dépannage des tests

### Erreur 401 - Non autorisé
**Cause:** Token manquant ou invalide
**Solution:** Vérifiez que vous avez bien ajouté le header `Authorization: Bearer TOKEN`

### Erreur 403 - Accès refusé
**Cause:** Vous n'avez pas les droits (admin requis)
**Solution:** Connectez-vous avec le compte admin

### Erreur 404 - Non trouvé
**Cause:** Route ou ressource inexistante
**Solution:** Vérifiez l'URL et l'ID de la ressource

### Erreur 500 - Erreur serveur
**Cause:** Problème dans le code backend
**Solution:** Consultez les logs du serveur dans le terminal

## 📊 Tests automatisés (à venir)

Pour exécuter les tests automatisés:

```bash
npm test
```

## 🎨 Tester avec une interface graphique

### Option 1: MongoDB Compass
- Connectez-vous à votre base de données
- Visualisez les collections créées
- Vérifiez les données après chaque test

### Option 2: Thunder Client (Extension VS Code)
1. Installez l'extension Thunder Client
2. Créez des requêtes directement dans VS Code
3. Organisez vos tests par collection

## ✅ Checklist de test

- [ ] Le serveur démarre sans erreur
- [ ] Health check répond correctement
- [ ] Inscription d'un utilisateur fonctionne
- [ ] Connexion fonctionne et retourne un token
- [ ] Liste des brebis est accessible
- [ ] Création de brebis (admin) fonctionne
- [ ] Mise à jour de brebis (admin) fonctionne
- [ ] Suppression de brebis (admin) fonctionne
- [ ] Création de session de paiement fonctionne
- [ ] Dashboard admin affiche les statistiques
- [ ] Mes investissements sont accessibles
- [ ] Les statistiques utilisateur sont correctes

## 🔐 Comptes de test

Après avoir exécuté `npm run seed`:

**Admin:**
- Email: `admin@brebisinvest.fr`
- Password: `Admin@123456`

**Utilisateurs:**
- Email: `jean.dupont@example.com` | Password: `password123`
- Email: `marie.martin@example.com` | Password: `password123`

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs du serveur
2. Vérifiez que MongoDB est connecté
3. Vérifiez le format de vos requêtes
4. Consultez la documentation de l'API

---

**Happy Testing! 🧪✨**
