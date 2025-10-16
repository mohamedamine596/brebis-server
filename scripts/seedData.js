require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Brebis = require('../models/Brebis');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Supprimer les données existantes
    console.log('🗑️  Suppression des données existantes...');
    await User.deleteMany({});
    await Brebis.deleteMany({});

    // Créer un utilisateur admin
    console.log('👤 Création de l\'administrateur...');
    const admin = await User.create({
      nom: 'Administrateur',
      email: process.env.ADMIN_EMAIL || 'admin@brebisinvest.fr',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin'
    });
    console.log(`✅ Admin créé: ${admin.email}`);

    // Créer quelques utilisateurs de test
    console.log('👥 Création d\'utilisateurs de test...');
    const users = await User.create([
      {
        nom: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        nom: 'Marie Martin',
        email: 'marie.martin@example.com',
        password: 'password123',
        role: 'user'
      }
    ]);
    console.log(`✅ ${users.length} utilisateurs créés`);

    // Créer des brebis de test
    console.log('🐑 Création des brebis de test...');
    const brebis = await Brebis.create([
      {
        nom: 'Bella',
        description: 'Brebis de race Mérinos, excellente productrice de laine',
        prix: 150,
        age: 2,
        race: 'Mérinos',
        image: 'bella.jpg',
        disponible: true,
        caracteristiques: {
          poids: 65,
          sante: 'Excellente',
          reproduction: true
        }
      },
      {
        nom: 'Dolly',
        description: 'Jeune brebis Suffolk, race à viande de qualité',
        prix: 180,
        age: 1,
        race: 'Suffolk',
        image: 'dolly.jpg',
        disponible: true,
        caracteristiques: {
          poids: 70,
          sante: 'Bonne',
          reproduction: true
        }
      },
      {
        nom: 'Marguerite',
        description: 'Brebis Lacaune, excellente pour la production laitière',
        prix: 200,
        age: 3,
        race: 'Lacaune',
        image: 'marguerite.jpg',
        disponible: true,
        caracteristiques: {
          poids: 75,
          sante: 'Excellente',
          reproduction: true
        }
      },
      {
        nom: 'Blanchette',
        description: 'Brebis Île-de-France, robuste et polyvalente',
        prix: 160,
        age: 2,
        race: 'Île-de-France',
        image: 'blanchette.jpg',
        disponible: true,
        caracteristiques: {
          poids: 68,
          sante: 'Bonne',
          reproduction: true
        }
      },
      {
        nom: 'Rosie',
        description: 'Brebis Texel, connue pour sa viande de qualité',
        prix: 190,
        age: 2,
        race: 'Texel',
        image: 'rosie.jpg',
        disponible: true,
        caracteristiques: {
          poids: 72,
          sante: 'Excellente',
          reproduction: false
        }
      },
      {
        nom: 'Luna',
        description: 'Jeune agnelle Mérinos, pleine de potentiel',
        prix: 120,
        age: 1,
        race: 'Mérinos',
        image: 'luna.jpg',
        disponible: true,
        caracteristiques: {
          poids: 55,
          sante: 'Bonne',
          reproduction: false
        }
      },
      {
        nom: 'Caramel',
        description: 'Brebis Ouessant, race miniature très rustique',
        prix: 100,
        age: 3,
        race: 'Ouessant',
        image: 'caramel.jpg',
        disponible: true,
        caracteristiques: {
          poids: 45,
          sante: 'Excellente',
          reproduction: true
        }
      },
      {
        nom: 'Flocon',
        description: 'Brebis Romney, excellente laine pour la filature',
        prix: 170,
        age: 2,
        race: 'Romney',
        image: 'flocon.jpg',
        disponible: true,
        caracteristiques: {
          poids: 66,
          sante: 'Bonne',
          reproduction: true
        }
      }
    ]);
    console.log(`✅ ${brebis.length} brebis créées`);

    console.log('\n🎉 Données initialisées avec succès!');
    console.log('\n📝 Informations de connexion admin:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Mot de passe: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log('\n💡 Utilisateurs de test:');
    console.log('   Email: jean.dupont@example.com | Mot de passe: password123');
    console.log('   Email: marie.martin@example.com | Mot de passe: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

seedData();
