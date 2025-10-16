# 🔗 Guide d'intégration Frontend React ↔️ Backend

## ✅ Configuration actuelle

### Backend
- **Port:** 5000
- **URL:** http://localhost:5000
- **Status:** ✅ En ligne
- **CORS:** Configuré pour http://localhost:3001

### Frontend React
- **Port:** 3001
- **URL:** http://localhost:3001
- **Status:** ✅ En ligne

---

## 📡 Configuration de l'API dans React

### 1. Créer un fichier de configuration API

Créez `src/config/api.js` dans votre projet React :

```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;
```

### 2. Créer un fichier `.env` dans votre frontend

```env
# .env (à la racine de votre projet React)
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Créer un service API

Créez `src/services/api.js` :

```javascript
// src/services/api.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🎯 Services API pour votre application

### Service d'authentification

```javascript
// src/services/authService.js
import api from './api';

export const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtenir le profil
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/updateProfile', userData);
    return response.data;
  },

  // Changer le mot de passe
  updatePassword: async (passwords) => {
    const response = await api.put('/auth/updatePassword', passwords);
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

### Service Brebis

```javascript
// src/services/brebisService.js
import api from './api';

export const brebisService = {
  // Obtenir toutes les brebis
  getAllBrebis: async (params = {}) => {
    const response = await api.get('/brebis', { params });
    return response.data;
  },

  // Obtenir une brebis par ID
  getBrebisById: async (id) => {
    const response = await api.get(`/brebis/${id}`);
    return response.data;
  },

  // Créer une brebis (Admin)
  createBrebis: async (brebisData) => {
    const response = await api.post('/brebis', brebisData);
    return response.data;
  },

  // Mettre à jour une brebis (Admin)
  updateBrebis: async (id, brebisData) => {
    const response = await api.put(`/brebis/${id}`, brebisData);
    return response.data;
  },

  // Supprimer une brebis (Admin)
  deleteBrebis: async (id) => {
    const response = await api.delete(`/brebis/${id}`);
    return response.data;
  },

  // Statistiques (Admin)
  getStats: async () => {
    const response = await api.get('/brebis/admin/stats');
    return response.data;
  },
};
```

### Service Paiement

```javascript
// src/services/paymentService.js
import api from './api';

export const paymentService = {
  // Créer une session de paiement
  createCheckoutSession: async (brebisId) => {
    const response = await api.post('/payment/create-checkout-session', {
      brebisId,
    });
    return response.data;
  },

  // Vérifier le statut d'une session
  getSessionStatus: async (sessionId) => {
    const response = await api.get(`/payment/session/${sessionId}`);
    return response.data;
  },

  // Obtenir l'historique des transactions
  getTransactions: async (params = {}) => {
    const response = await api.get('/payment/transactions', { params });
    return response.data;
  },
};
```

### Service Investissements

```javascript
// src/services/investmentService.js
import api from './api';

export const investmentService = {
  // Mes investissements
  getMyInvestments: async (params = {}) => {
    const response = await api.get('/investments', { params });
    return response.data;
  },

  // Détails d'un investissement
  getInvestmentById: async (id) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  // Statistiques
  getStats: async () => {
    const response = await api.get('/investments/stats');
    return response.data;
  },

  // Activités récentes
  getRecentActivities: async (limit = 5) => {
    const response = await api.get('/investments/activities', {
      params: { limit },
    });
    return response.data;
  },
};
```

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

  // Investissements
  getAllInvestments: async (params = {}) => {
    const response = await api.get('/admin/investments', { params });
    return response.data;
  },

  // Transactions
  getAllTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },
};
```

---

## 🎨 Exemples d'utilisation dans les composants React

### Exemple 1: Page de connexion

```jsx
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log('Connexion réussie:', response);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

### Exemple 2: Liste des brebis

```jsx
// src/pages/BrebisListPage.jsx
import React, { useState, useEffect } from 'react';
import { brebisService } from '../services/brebisService';

function BrebisListPage() {
  const [brebis, setBrebis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBrebis();
  }, []);

  const fetchBrebis = async () => {
    try {
      const response = await brebisService.getAllBrebis({ disponible: true });
      setBrebis(response.data.brebis);
    } catch (err) {
      setError('Erreur lors du chargement des brebis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="brebis-list">
      <h1>Brebis disponibles</h1>
      <div className="brebis-grid">
        {brebis.map((b) => (
          <div key={b._id} className="brebis-card">
            <img src={b.image} alt={b.nom} />
            <h3>{b.nom}</h3>
            <p>{b.description}</p>
            <p className="price">{b.prix} €</p>
            <button onClick={() => handleInvest(b._id)}>
              Investir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrebisListPage;
```

### Exemple 3: Dashboard utilisateur

```jsx
// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';

function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        investmentService.getStats(),
        investmentService.getRecentActivities(),
      ]);
      setStats(statsData.data);
      setActivities(activitiesData.data.activities);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <div className="dashboard">
      <h1>Mon Espace</h1>
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Brebis possédées</h3>
            <p className="big-number">{stats.nombreBrebis}</p>
          </div>
          <div className="stat-card">
            <h3>Montant investi</h3>
            <p className="big-number">{stats.montantTotalInvesti} €</p>
          </div>
          <div className="stat-card">
            <h3>Gains totaux</h3>
            <p className="big-number">{stats.gainsTotal} €</p>
          </div>
        </div>
      )}
      <div className="recent-activities">
        <h2>Activités récentes</h2>
        {activities.map((activity) => (
          <div key={activity._id} className="activity-item">
            <p>{activity.brebis.nom}</p>
            <p>{activity.montant} €</p>
            <p>{new Date(activity.dateInvestissement).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;
```

---

## 🔒 Protection des routes

### Créer un composant PrivateRoute

```jsx
// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

function PrivateRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
```

### Utilisation dans le routeur

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🧪 Tester la connexion Frontend ↔️ Backend

### Test rapide depuis la console du navigateur

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Test de connexion
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend connecté:', data));

// Test d'authentification
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@brebisinvest.fr',
    password: 'Admin@123456'
  })
})
  .then(res => res.json())
  .then(data => console.log('Login:', data));
```

---

## 📦 Dépendances à installer dans React

```bash
# Dans votre projet React
npm install axios react-router-dom
```

---

## ✅ Checklist d'intégration

- [ ] Installer axios dans React
- [ ] Créer le fichier `.env` avec `REACT_APP_API_URL`
- [ ] Créer `src/config/api.js`
- [ ] Créer `src/services/api.js` avec axios
- [ ] Créer les services (authService, brebisService, etc.)
- [ ] Tester la connexion depuis la console
- [ ] Implémenter le login
- [ ] Implémenter la liste des brebis
- [ ] Implémenter le dashboard
- [ ] Tester le flow complet

---

## 🎯 Workflow complet

1. **Utilisateur s'inscrit** → `authService.register()`
2. **Utilisateur se connecte** → `authService.login()` → Token stocké
3. **Voir les brebis** → `brebisService.getAllBrebis()`
4. **Acheter une brebis** → `paymentService.createCheckoutSession()`
5. **Redirection Stripe** → Paiement
6. **Retour sur le site** → Webhook confirme automatiquement
7. **Voir investissements** → `investmentService.getMyInvestments()`

---

## 🚀 Status actuel

✅ **Backend:** En ligne sur http://localhost:5000
✅ **Frontend:** En ligne sur http://localhost:3001
✅ **CORS:** Configuré correctement
✅ **MongoDB:** Connecté
✅ **Données de test:** Disponibles

**Vous pouvez maintenant connecter votre frontend React au backend ! 🎉**

---

## 💡 Conseils

1. Utilisez React Context ou Redux pour gérer l'état d'authentification
2. Créez des hooks personnalisés (useAuth, useBrebis, etc.)
3. Gérez les erreurs avec des notifications toast
4. Ajoutez des loaders pendant les requêtes
5. Implémentez un système de cache si nécessaire

**Bon développement ! 🚀**
