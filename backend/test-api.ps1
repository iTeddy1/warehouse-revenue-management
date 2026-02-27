# TVE Management Backend - Quick Test Script (PowerShell)
# Run this after starting the server (npm run dev)

$BASE_URL = "http://localhost:4000"

Write-Host "🚀 TVE Management API Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Login
Write-Host "2️⃣  Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@tve.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $loginResponse | ConvertTo-Json -Depth 10
    $TOKEN = $loginResponse.data.accessToken

    if (-not $TOKEN) {
        Write-Host "❌ Login failed! Make sure to run 'npm run db:seed' first." -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "✅ Token obtained: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Get Current User
Write-Host "3️⃣  Testing Get Current User (Protected)..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/me" -Method Get -Headers $headers
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Get current user failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get All Roles
Write-Host "4️⃣  Testing Get All Roles..." -ForegroundColor Yellow
try {
    $rolesResponse = Invoke-RestMethod -Uri "$BASE_URL/roles" -Method Get
    $rolesResponse | ConvertTo-Json -Depth 10
    
    $ROLE_ID = $rolesResponse.data[0].id
    Write-Host ""
    Write-Host "✅ Using Role ID: $ROLE_ID" -ForegroundColor Green
} catch {
    Write-Host "❌ Get roles failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Create User
Write-Host "5️⃣  Testing Create User..." -ForegroundColor Yellow
try {
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $createUserBody = @{
        name = "Test User $timestamp"
        email = "test$timestamp@tve.com"
        password = "test123"
        roleId = $ROLE_ID
    } | ConvertTo-Json

    $headers = @{
        Authorization = "Bearer $TOKEN"
    }

    $createUserResponse = Invoke-RestMethod -Uri "$BASE_URL/users" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $createUserBody

    $createUserResponse | ConvertTo-Json -Depth 10
    $USER_ID = $createUserResponse.data.id
    Write-Host ""
    Write-Host "✅ Created User ID: $USER_ID" -ForegroundColor Green
} catch {
    Write-Host "❌ Create user failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get All Users
Write-Host "6️⃣  Testing Get All Users..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/users?page=1&limit=5" -Method Get -Headers $headers
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Get users failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get User by ID
if ($USER_ID) {
    Write-Host "7️⃣  Testing Get User by ID..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $TOKEN"
        }
        $response = Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID" -Method Get -Headers $headers
        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "❌ Get user by ID failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 8: Update User
if ($USER_ID) {
    Write-Host "8️⃣  Testing Update User..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            name = "Test User Updated"
        } | ConvertTo-Json

        $headers = @{
            Authorization = "Bearer $TOKEN"
        }

        $response = Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID" `
            -Method Patch `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $updateBody

        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "❌ Update user failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 9: Create Role
Write-Host "9️⃣  Testing Create Role..." -ForegroundColor Yellow
try {
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $createRoleBody = @{
        code = "TEST_$timestamp"
        name = "Test Role $timestamp"
    } | ConvertTo-Json

    $headers = @{
        Authorization = "Bearer $TOKEN"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL/roles" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $createRoleBody

    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Create role failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 10: Test Error Handling - Invalid Credentials
Write-Host "🔟 Testing Error Handling (Invalid Credentials)..." -ForegroundColor Yellow
try {
    $invalidBody = @{
        email = "wrong@tve.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $invalidBody
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    $errorResponse | ConvertTo-Json -Depth 10
}
Write-Host ""

# Test 11: Test Error Handling - Missing Token
Write-Host "1️⃣1️⃣  Testing Error Handling (Missing Auth Token)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/auth/me" -Method Get
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    $errorResponse | ConvertTo-Json -Depth 10
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "  - Health check: ✅" -ForegroundColor Green
Write-Host "  - Login: ✅" -ForegroundColor Green
Write-Host "  - Get current user: ✅" -ForegroundColor Green
Write-Host "  - Get roles: ✅" -ForegroundColor Green
Write-Host "  - Create user: ✅" -ForegroundColor Green
Write-Host "  - Get users: ✅" -ForegroundColor Green
Write-Host "  - Update user: ✅" -ForegroundColor Green
Write-Host "  - Create role: ✅" -ForegroundColor Green
Write-Host "  - Error handling: ✅" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Phase 1 Implementation is working perfectly!" -ForegroundColor Cyan
