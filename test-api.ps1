# Script PowerShell pour tester l'API Brebis Invest
# Utilisation: .\test-api.ps1

$baseUrl = "http://localhost:5000/api"

Write-Host "🧪 Test de l'API Brebis Invest" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "✅ Test 1: Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "  ✓ Serveur en ligne" -ForegroundColor Green
    Write-Host "  Message: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Liste des brebis
Write-Host "✅ Test 2: Récupération de la liste des brebis" -ForegroundColor Cyan
try {
    $brebis = Invoke-RestMethod -Uri "$baseUrl/brebis" -Method GET
    Write-Host "  ✓ $($brebis.count) brebis trouvées" -ForegroundColor Green
    if ($brebis.data.brebis.Count -gt 0) {
        $premiereBrebis = $brebis.data.brebis[0]
        Write-Host "  Première brebis: $($premiereBrebis.nom) - $($premiereBrebis.prix)€" -ForegroundColor Gray
        $brebisId = $premiereBrebis._id
    }
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Connexion Admin
Write-Host "✅ Test 3: Connexion administrateur" -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "admin@brebisinvest.fr"
        password = "Admin@123456"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $adminToken = $loginResponse.data.token
    Write-Host "  ✓ Connexion réussie" -ForegroundColor Green
    Write-Host "  Admin: $($loginResponse.data.user.nom)" -ForegroundColor Gray
    Write-Host "  Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Profil Admin
Write-Host "✅ Test 4: Récupération du profil admin" -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $profile = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "  ✓ Profil récupéré" -ForegroundColor Green
    Write-Host "  Nom: $($profile.data.user.nom)" -ForegroundColor Gray
    Write-Host "  Email: $($profile.data.user.email)" -ForegroundColor Gray
    Write-Host "  Rôle: $($profile.data.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Statistiques Admin
Write-Host "✅ Test 5: Dashboard administrateur" -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method GET -Headers $headers
    Write-Host "  ✓ Statistiques récupérées" -ForegroundColor Green
    Write-Host "  Utilisateurs: $($dashboard.data.users.total)" -ForegroundColor Gray
    Write-Host "  Brebis: $($dashboard.data.brebis.total) (Disponibles: $($dashboard.data.brebis.disponibles))" -ForegroundColor Gray
    Write-Host "  Investissements: $($dashboard.data.investissements.total)" -ForegroundColor Gray
    Write-Host "  Revenu total: $($dashboard.data.finances.revenuTotal)€" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Inscription d'un nouvel utilisateur
Write-Host "✅ Test 6: Inscription d'un nouvel utilisateur" -ForegroundColor Cyan
try {
    $registerBody = @{
        nom = "Utilisateur Test"
        email = "test_$(Get-Random)@example.com"
        password = "password123"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $userToken = $registerResponse.data.token
    Write-Host "  ✓ Inscription réussie" -ForegroundColor Green
    Write-Host "  Utilisateur: $($registerResponse.data.user.nom)" -ForegroundColor Gray
    Write-Host "  Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Connexion utilisateur existant
Write-Host "✅ Test 7: Connexion utilisateur existant" -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "jean.dupont@example.com"
        password = "password123"
    } | ConvertTo-Json

    $userLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "  ✓ Connexion réussie" -ForegroundColor Green
    Write-Host "  Utilisateur: $($userLoginResponse.data.user.nom)" -ForegroundColor Gray
    Write-Host "  Brebis possédées: $($userLoginResponse.data.user.nombreBrebis)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Tests terminés!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Liens utiles:" -ForegroundColor Yellow
Write-Host "  - API: http://localhost:5000" -ForegroundColor Gray
Write-Host "  - Health: http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host "  - Brebis: http://localhost:5000/api/brebis" -ForegroundColor Gray
Write-Host ""
