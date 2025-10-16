# 👑 Guide Complet - Espace Administrateur

## ✅ L'espace administrateur est COMPLET et FONCTIONNEL !

Le backend contient toutes les fonctionnalités nécessaires pour gérer votre plateforme Brebis Invest.

---

## 🎯 Fonctionnalités Administrateur

### 1. 📊 Dashboard Global

**Endpoint:** `GET /api/admin/dashboard`

Affiche toutes les statistiques importantes :

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 3,
      "active": 3,
      "admins": 1
    },
    "brebis": {
      "total": 8,
      "disponibles": 8,
      "vendues": 0
    },
    "investissements": {
      "total": 0,
      "confirmes": 0
    },
    "finances": {
      "revenuTotal": 0,
      "nombreTransactions": 0
    },
    "recentUsers": [...],
    "recentTransactions": [...]
  }
}
```

**Informations affichées:**
- ✅ Nombre total d'utilisateurs (actifs, inactifs, admins)
- ✅ Nombre de brebis (total, disponibles, vendues)
- ✅ Statistiques d'investissements
- ✅ Revenus totaux et nombre de transactions
- ✅ Liste des 5 derniers utilisateurs inscrits
- ✅ Liste des 10 dernières transactions

---

### 2. 👥 Gestion des Utilisateurs

#### Liste de tous les utilisateurs
**Endpoint:** `GET /api/admin/users`

**Paramètres:**
- `page` (default: 1) - Numéro de page
- `limit` (default: 10) - Nombre par page
- `role` (optional) - Filtrer par rôle (user/admin)
- `isActive` (optional) - Filtrer par statut (true/false)

**Exemple:**
```bash
GET /api/admin/users?page=1&limit=10&role=user&isActive=true
```

#### Détails d'un utilisateur
**Endpoint:** `GET /api/admin/users/:id`

Affiche:
- Informations personnelles
- Statistiques d'investissement
- Liste de tous ses investissements

#### Modifier un utilisateur
**Endpoint:** `PUT /api/admin/users/:id`

```json
{
  "nom": "Nouveau nom",
  "email": "nouveau@email.com",
  "role": "admin",
  "isActive": true
}
```

**Cas d'usage:**
- Changer le rôle (user → admin)
- Désactiver un compte
- Modifier les informations

#### Supprimer un utilisateur
**Endpoint:** `DELETE /api/admin/users/:id`

⚠️ **Protection:** Impossible de supprimer un admin

---

### 3. 🐑 Gestion des Brebis

#### Créer une brebis
**Endpoint:** `POST /api/brebis`

```json
{
  "nom": "Bella",
  "description": "Belle brebis Mérinos de 2 ans",
  "prix": 150,
  "age": 2,
  "race": "Mérinos",
  "image": "bella.jpg",
  "disponible": true,
  "caracteristiques": {
    "poids": 65,
    "sante": "Excellente",
    "reproduction": true
  }
}
```

#### Modifier une brebis
**Endpoint:** `PUT /api/brebis/:id`

```json
{
  "prix": 175,
  "description": "Description mise à jour",
  "disponible": false
}
```

#### Supprimer une brebis
**Endpoint:** `DELETE /api/brebis/:id`

⚠️ **Protection:** Impossible de supprimer une brebis déjà vendue

#### Statistiques des brebis
**Endpoint:** `GET /api/brebis/admin/stats`

```json
{
  "success": true,
  "data": {
    "totalBrebis": 8,
    "disponibles": 8,
    "vendues": 0,
    "prixMoyen": 143.75,
    "prixMin": 100,
    "prixMax": 200,
    "valeurTotale": 1150
  }
}
```

---

### 4. 💼 Vue des Investissements

**Endpoint:** `GET /api/admin/investments`

**Paramètres:**
- `page` (default: 1)
- `limit` (default: 10)
- `statut` (optional) - en_attente/confirme/annule

**Affiche:**
- Tous les investissements de tous les utilisateurs
- Détails de chaque investissement
- Informations sur l'utilisateur et la brebis

---

### 5. 💳 Vue des Transactions

**Endpoint:** `GET /api/admin/transactions`

**Paramètres:**
- `page` (default: 1)
- `limit` (default: 10)
- `statut` (optional) - en_attente/reussie/echouee/remboursee
- `type` (optional) - achat/gain/retrait

**Affiche:**
- Toutes les transactions
- Statut de paiement
- Informations Stripe
- Montants et dates

---

## 🔐 Sécurité Admin

### Middleware de protection

Toutes les routes admin sont protégées par 2 middlewares:

1. **`protect`** - Vérifie le JWT token
2. **`admin`** - Vérifie que l'utilisateur a le rôle "admin"

```javascript
// routes/adminRoutes.js
router.use(protect);  // Authentification requise
router.use(admin);    // Rôle admin requis
```

### Vérifications supplémentaires

- ✅ Impossible de supprimer un admin
- ✅ Impossible de supprimer une brebis vendue
- ✅ Validation des données
- ✅ Logs des actions admin

---

## 🧪 Tester l'espace admin

### Option 1: Script PowerShell automatique

```bash
cd backend
.\test-admin.ps1
```

Ce script teste automatiquement:
- Connexion admin
- Dashboard
- Liste des utilisateurs
- Statistiques brebis
- CRUD brebis
- Investissements
- Transactions

### Option 2: Postman

1. Importez la collection: `postman/Brebis-Invest-API.postman_collection.json`
2. Utilisez "Login Admin" pour obtenir le token
3. Testez les routes dans la section "Admin"

### Option 3: Manuel avec cURL/PowerShell

```powershell
# 1. Connexion admin
$loginBody = @{
    email = "admin@brebisinvest.fr"
    password = "Admin@123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $response.data.token

# 2. Dashboard
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard" `
    -Method GET `
    -Headers $headers

# 3. Liste des utilisateurs
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" `
    -Method GET `
    -Headers $headers

# 4. Créer une brebis
$brebis = @{
    nom = "Nouvelle Brebis"
    description = "Description"
    prix = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/brebis" `
    -Method POST `
    -Headers $headers `
    -Body $brebis `
    -ContentType "application/json"
```

---

## 🎨 Intégration Frontend React

### Service Admin

```javascript
// src/services/adminService.js
import api from './api';

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Utilisateurs
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Brebis
  createBrebis: async (brebisData) => {
    const response = await api.post('/brebis', brebisData);
    return response.data;
  },

  updateBrebis: async (id, brebisData) => {
    const response = await api.put(`/brebis/${id}`, brebisData);
    return response.data;
  },

  deleteBrebis: async (id) => {
    const response = await api.delete(`/brebis/${id}`);
    return response.data;
  },

  getBrebisStats: async () => {
    const response = await api.get('/brebis/admin/stats');
    return response.data;
  },

  // Investissements & Transactions
  getAllInvestments: async (params = {}) => {
    const response = await api.get('/admin/investments', { params });
    return response.data;
  },

  getAllTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },
};
```

### Composant Dashboard Admin (React)

```jsx
// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminService.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Administrateur</h1>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <p className="big-number">{stats.users.total}</p>
          <p>Actifs: {stats.users.active}</p>
        </div>

        <div className="stat-card">
          <h3>Brebis</h3>
          <p className="big-number">{stats.brebis.total}</p>
          <p>Disponibles: {stats.brebis.disponibles}</p>
        </div>

        <div className="stat-card">
          <h3>Revenu Total</h3>
          <p className="big-number">{stats.finances.revenuTotal} €</p>
          <p>Transactions: {stats.finances.nombreTransactions}</p>
        </div>

        <div className="stat-card">
          <h3>Investissements</h3>
          <p className="big-number">{stats.investissements.total}</p>
          <p>Confirmés: {stats.investissements.confirmes}</p>
        </div>
      </div>

      {/* Utilisateurs récents */}
      <div className="recent-users">
        <h2>Derniers Utilisateurs</h2>
        {stats.recentUsers.map(user => (
          <div key={user._id} className="user-item">
            <span>{user.nom}</span>
            <span>{user.email}</span>
            <span>{user.role}</span>
          </div>
        ))}
      </div>

      {/* Transactions récentes */}
      <div className="recent-transactions">
        <h2>Dernières Transactions</h2>
        {stats.recentTransactions.map(transaction => (
          <div key={transaction._id} className="transaction-item">
            <span>{transaction.montant} €</span>
            <span>{transaction.statut}</span>
            <span>{new Date(transaction.dateTransaction).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
```

### Composant Gestion des Brebis

```jsx
// src/pages/admin/BrebisManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { brebisService } from '../../services/brebisService';

function BrebisManagement() {
  const [brebis, setBrebis] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBrebis, setEditingBrebis] = useState(null);

  useEffect(() => {
    fetchBrebis();
  }, []);

  const fetchBrebis = async () => {
    const response = await brebisService.getAllBrebis();
    setBrebis(response.data.brebis);
  };

  const handleCreate = async (formData) => {
    await adminService.createBrebis(formData);
    fetchBrebis();
    setShowModal(false);
  };

  const handleUpdate = async (id, formData) => {
    await adminService.updateBrebis(id, formData);
    fetchBrebis();
    setEditingBrebis(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette brebis ?')) {
      await adminService.deleteBrebis(id);
      fetchBrebis();
    }
  };

  return (
    <div className="brebis-management">
      <div className="header">
        <h1>Gestion des Brebis</h1>
        <button onClick={() => setShowModal(true)}>
          + Nouvelle Brebis
        </button>
      </div>

      <table className="brebis-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Race</th>
            <th>Prix</th>
            <th>Age</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brebis.map(b => (
            <tr key={b._id}>
              <td>{b.nom}</td>
              <td>{b.race}</td>
              <td>{b.prix} €</td>
              <td>{b.age} ans</td>
              <td>
                {b.vendue ? '🔴 Vendue' : 
                 b.disponible ? '🟢 Disponible' : '🟠 Indisponible'}
              </td>
              <td>
                <button onClick={() => setEditingBrebis(b)}>✏️</button>
                <button onClick={() => handleDelete(b._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BrebisManagement;
```

---

## 🔑 Compte Administrateur

**Compte par défaut:**
- Email: `admin@brebisinvest.fr`
- Mot de passe: `Admin@123456`

⚠️ **Important:** Changez ce mot de passe en production !

---

## 📋 Checklist Espace Admin

- [x] Dashboard avec statistiques globales
- [x] Liste des utilisateurs avec pagination
- [x] Détails d'un utilisateur
- [x] Modifier un utilisateur
- [x] Supprimer un utilisateur
- [x] Créer une brebis
- [x] Modifier une brebis
- [x] Supprimer une brebis
- [x] Statistiques des brebis
- [x] Liste de tous les investissements
- [x] Liste de toutes les transactions
- [x] Protection JWT
- [x] Vérification du rôle admin
- [x] Validation des données
- [x] Gestion des erreurs

---

## 🎯 Structure des pages Admin recommandée

```
frontend/src/pages/admin/
├── Dashboard.jsx          # Vue d'ensemble
├── Users/
│   ├── UserList.jsx      # Liste des utilisateurs
│   └── UserDetail.jsx    # Détails utilisateur
├── Brebis/
│   ├── BrebisManagement.jsx  # CRUD brebis
│   └── BrebisStats.jsx       # Statistiques
├── Investments/
│   └── InvestmentList.jsx    # Tous les investissements
└── Transactions/
    └── TransactionList.jsx   # Toutes les transactions
```

---

## ✅ Conclusion

**L'espace administrateur backend est 100% fonctionnel !** 👑

Vous avez accès à:
- ✅ **8 routes admin** dédiées
- ✅ **Dashboard complet** avec statistiques
- ✅ **CRUD complet** sur les brebis
- ✅ **Gestion des utilisateurs**
- ✅ **Vue globale** des investissements et transactions
- ✅ **Sécurité renforcée** (JWT + vérification rôle)
- ✅ **Documentation complète**
- ✅ **Script de test** automatisé

**Il ne reste qu'à créer l'interface frontend React !** 🚀
