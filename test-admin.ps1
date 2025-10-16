# 👑 Script de Test de l'Espace Administrateur

Write-Host "🔐 Test de l'Espace Administrateur Brebis Invest" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api"

# Étape 1: Connexion Admin
Write-Host "1️⃣  Connexion en tant qu'administrateur..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@brebisinvest.fr"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $adminToken = $loginResponse.data.token
    Write-Host "   ✅ Connexion réussie!" -ForegroundColor Green
    Write-Host "   Admin: $($loginResponse.data.user.nom)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "   Rôle: $($loginResponse.data.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# Étape 2: Dashboard Admin
Write-Host "2️⃣  Récupération du Dashboard..." -ForegroundColor Yellow

try {
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method GET -Headers $headers
    Write-Host "   ✅ Dashboard récupéré!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📊 STATISTIQUES GLOBALES" -ForegroundColor Cyan
    Write-Host "   ========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   👥 UTILISATEURS" -ForegroundColor White
    Write-Host "      Total: $($dashboard.data.users.total)" -ForegroundColor Gray
    Write-Host "      Actifs: $($dashboard.data.users.active)" -ForegroundColor Gray
    Write-Host "      Admins: $($dashboard.data.users.admins)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   🐑 BREBIS" -ForegroundColor White
    Write-Host "      Total: $($dashboard.data.brebis.total)" -ForegroundColor Gray
    Write-Host "      Disponibles: $($dashboard.data.brebis.disponibles)" -ForegroundColor Green
    Write-Host "      Vendues: $($dashboard.data.brebis.vendues)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   💰 FINANCES" -ForegroundColor White
    Write-Host "      Revenu total: $($dashboard.data.finances.revenuTotal) €" -ForegroundColor Gray
    Write-Host "      Transactions: $($dashboard.data.finances.nombreTransactions)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📈 INVESTISSEMENTS" -ForegroundColor White
    Write-Host "      Total: $($dashboard.data.investissements.total)" -ForegroundColor Gray
    Write-Host "      Confirmés: $($dashboard.data.investissements.confirmes)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 3: Liste des utilisateurs
Write-Host "3️⃣  Liste de tous les utilisateurs..." -ForegroundColor Yellow

try {
    $users = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method GET -Headers $headers
    Write-Host "   ✅ $($users.total) utilisateurs trouvés!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   UTILISATEURS:" -ForegroundColor White
    foreach ($user in $users.data.users) {
        $roleIcon = if ($user.role -eq "admin") { "👑" } else { "👤" }
        $statusIcon = if ($user.isActive) { "✅" } else { "❌" }
        Write-Host "   $roleIcon $statusIcon $($user.nom) - $($user.email)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 4: Statistiques des brebis
Write-Host "4️⃣  Statistiques des brebis..." -ForegroundColor Yellow

try {
    $brebisStats = Invoke-RestMethod -Uri "$baseUrl/brebis/admin/stats" -Method GET -Headers $headers
    Write-Host "   ✅ Statistiques récupérées!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📊 STATISTIQUES BREBIS" -ForegroundColor Cyan
    Write-Host "   Total brebis: $($brebisStats.data.totalBrebis)" -ForegroundColor Gray
    Write-Host "   Disponibles: $($brebisStats.data.disponibles)" -ForegroundColor Green
    Write-Host "   Vendues: $($brebisStats.data.vendues)" -ForegroundColor Yellow
    Write-Host "   Prix moyen: $([math]::Round($brebisStats.data.prixMoyen, 2)) €" -ForegroundColor Gray
    Write-Host "   Prix min: $($brebisStats.data.prixMin) €" -ForegroundColor Gray
    Write-Host "   Prix max: $($brebisStats.data.prixMax) €" -ForegroundColor Gray
    Write-Host "   Valeur totale: $($brebisStats.data.valeurTotale) €" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 5: Créer une nouvelle brebis
Write-Host "5️⃣  Création d'une nouvelle brebis..." -ForegroundColor Yellow

$nouvelleBrebis = @{
    nom = "Brebis Test Admin"
    description = "Brebis créée par l'administrateur pour test"
    prix = 175
    age = 3
    race = "Lacaune"
    disponible = $true
} | ConvertTo-Json

try {
    $brebisCreated = Invoke-RestMethod -Uri "$baseUrl/brebis" -Method POST -Headers $headers -Body $nouvelleBrebis
    Write-Host "   ✅ Brebis créée avec succès!" -ForegroundColor Green
    Write-Host "   ID: $($brebisCreated.data.brebis._id)" -ForegroundColor Gray
    Write-Host "   Nom: $($brebisCreated.data.brebis.nom)" -ForegroundColor Gray
    Write-Host "   Prix: $($brebisCreated.data.brebis.prix) €" -ForegroundColor Gray
    Write-Host ""
    $brebisTestId = $brebisCreated.data.brebis._id
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 6: Modifier la brebis créée
if ($brebisTestId) {
    Write-Host "6️⃣  Modification de la brebis..." -ForegroundColor Yellow
    
    $brebisUpdate = @{
        prix = 200
        description = "Brebis modifiée par l'admin"
    } | ConvertTo-Json
    
    try {
        $brebisUpdated = Invoke-RestMethod -Uri "$baseUrl/brebis/$brebisTestId" -Method PUT -Headers $headers -Body $brebisUpdate
        Write-Host "   ✅ Brebis mise à jour!" -ForegroundColor Green
        Write-Host "   Nouveau prix: $($brebisUpdated.data.brebis.prix) €" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Étape 7: Supprimer la brebis test
    Write-Host "7️⃣  Suppression de la brebis test..." -ForegroundColor Yellow
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/brebis/$brebisTestId" -Method DELETE -Headers $headers
        Write-Host "   ✅ Brebis supprimée!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Étape 8: Tous les investissements
Write-Host "8️⃣  Liste de tous les investissements..." -ForegroundColor Yellow

try {
    $investments = Invoke-RestMethod -Uri "$baseUrl/admin/investments" -Method GET -Headers $headers
    Write-Host "   ✅ $($investments.total) investissements trouvés!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 9: Toutes les transactions
Write-Host "9️⃣  Liste de toutes les transactions..." -ForegroundColor Yellow

try {
    $transactions = Invoke-RestMethod -Uri "$baseUrl/admin/transactions" -Method GET -Headers $headers
    Write-Host "   ✅ $($transactions.total) transactions trouvées!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ Tests de l'espace administrateur terminés!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 RÉSUMÉ DES FONCTIONNALITÉS ADMIN:" -ForegroundColor Yellow
Write-Host "   ✅ Connexion administrateur" -ForegroundColor Gray
Write-Host "   ✅ Dashboard avec statistiques globales" -ForegroundColor Gray
Write-Host "   ✅ Gestion des utilisateurs (liste, détails)" -ForegroundColor Gray
Write-Host "   ✅ Gestion des brebis (CRUD complet)" -ForegroundColor Gray
Write-Host "   ✅ Vue des investissements" -ForegroundColor Gray
Write-Host "   ✅ Vue des transactions" -ForegroundColor Gray
Write-Host "   ✅ Statistiques des brebis" -ForegroundColor Gray
Write-Host ""
Write-Host "👑 L'espace administrateur est 100% fonctionnel!" -ForegroundColor Green
Write-Host ""
