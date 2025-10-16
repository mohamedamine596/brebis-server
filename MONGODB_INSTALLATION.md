# 📥 Guide d'Installation MongoDB

## Option 1 : MongoDB Community Edition (Recommandé pour le développement local)

### Installation sur Windows

1. **Télécharger MongoDB**
   - Allez sur https://www.mongodb.com/try/download/community
   - Sélectionnez la version Windows
   - Téléchargez le fichier MSI

2. **Installer MongoDB**
   - Exécutez le fichier MSI téléchargé
   - Choisissez "Complete" pour l'installation complète
   - Sélectionnez "Install MongoDB as a Service"
   - Laissez les paramètres par défaut

3. **Vérifier l'installation**
   ```powershell
   mongod --version
   ```

4. **Démarrer MongoDB**
   
   MongoDB devrait démarrer automatiquement comme service Windows.
   
   Pour démarrer manuellement :
   ```powershell
   net start MongoDB
   ```

   Pour arrêter :
   ```powershell
   net stop MongoDB
   ```

5. **Tester la connexion**
   ```powershell
   mongosh
   ```

## Option 2 : MongoDB Atlas (Cloud - Recommandé pour production)

MongoDB Atlas est une solution cloud gratuite et facile à utiliser :

1. **Créer un compte**
   - Allez sur https://www.mongodb.com/cloud/atlas/register
   - Créez un compte gratuit

2. **Créer un cluster**
   - Sélectionnez "Build a Database"
   - Choisissez "FREE" (M0 Sandbox)
   - Sélectionnez une région proche de vous
   - Cliquez sur "Create Cluster"

3. **Configurer l'accès**
   - **Database Access** : Créez un utilisateur avec un mot de passe
   - **Network Access** : Ajoutez votre IP ou utilisez `0.0.0.0/0` pour accepter toutes les IPs (développement uniquement)

4. **Obtenir la chaîne de connexion**
   - Cliquez sur "Connect" sur votre cluster
   - Choisissez "Connect your application"
   - Copiez la chaîne de connexion
   
   Exemple :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/brebis-invest?retryWrites=true&w=majority
   ```

5. **Configurer dans .env**
   ```env
   MONGODB_URI=mongodb+srv://votre_user:votre_password@cluster0.xxxxx.mongodb.net/brebis-invest?retryWrites=true&w=majority
   ```

## Option 3 : Docker (Pour les utilisateurs avancés)

Si vous avez Docker installé :

```bash
# Lancer MongoDB avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Arrêter MongoDB
docker stop mongodb

# Redémarrer MongoDB
docker start mongodb
```

Puis dans `.env` :
```env
MONGODB_URI=mongodb://localhost:27017/brebis-invest
```

## Vérification de l'installation

Après l'installation, testez la connexion :

### Méthode 1 : Avec mongosh (MongoDB Shell)
```bash
mongosh
```

Vous devriez voir :
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.x.x
```

### Méthode 2 : Avec le backend
```bash
cd backend
npm run dev
```

Vous devriez voir :
```
✅ MongoDB connecté: localhost
🚀 Serveur démarré sur le port 5000
```

## Dépannage

### Erreur : "mongod n'est pas reconnu"

**Solution** : Ajoutez MongoDB au PATH Windows

1. Trouvez le dossier d'installation MongoDB (généralement `C:\Program Files\MongoDB\Server\7.0\bin`)
2. Ouvrez les variables d'environnement Windows
3. Ajoutez le chemin au PATH système
4. Redémarrez le terminal

### Erreur : "Connection refused"

**Solutions** :
- Vérifiez que MongoDB est démarré : `net start MongoDB`
- Vérifiez l'URL de connexion dans `.env`
- Vérifiez le firewall Windows

### Erreur : "Authentication failed"

**Solutions** :
- Vérifiez le nom d'utilisateur et mot de passe dans MongoDB Atlas
- Assurez-vous que l'IP est autorisée dans Network Access

## MongoDB Compass (Interface graphique)

MongoDB Compass est un outil graphique pour visualiser vos données :

1. Téléchargez depuis https://www.mongodb.com/try/download/compass
2. Installez et lancez
3. Connectez-vous à `mongodb://localhost:27017`
4. Vous pouvez voir vos bases de données, collections, et documents

## Commandes MongoDB utiles

```bash
# Se connecter à MongoDB
mongosh

# Lister les bases de données
show dbs

# Utiliser une base de données
use brebis-invest

# Lister les collections
show collections

# Voir les documents d'une collection
db.users.find()
db.brebis.find()

# Compter les documents
db.users.countDocuments()

# Supprimer toutes les données (attention !)
db.users.deleteMany({})
db.brebis.deleteMany({})

# Quitter mongosh
exit
```

## Prochaines étapes

Une fois MongoDB installé et configuré :

1. Mettez à jour le fichier `.env` avec votre URL de connexion
2. Initialisez la base de données :
   ```bash
   npm run seed
   ```
3. Démarrez le serveur :
   ```bash
   npm run dev
   ```

## Recommandations

- **Développement** : MongoDB local ou MongoDB Atlas gratuit
- **Production** : MongoDB Atlas (avec cluster payant pour de meilleures performances)
- **Backup** : Configurez des sauvegardes automatiques avec MongoDB Atlas

---

**Besoin d'aide ?** Consultez la documentation officielle : https://docs.mongodb.com/
