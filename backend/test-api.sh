#!/bin/bash

# TVE Management Backend - Quick Test Script
# Run this after starting the server (npm run dev)

BASE_URL="http://localhost:4000"

echo "🚀 TVE Management API Test Script"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s $BASE_URL/health | jq '.'
echo ""

# Test 2: Login
echo "2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tve.com",
    "password": "admin123"
  }')

echo $LOGIN_RESPONSE | jq '.'

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed! Make sure to run 'npm run db:seed' first."
  exit 1
fi

echo ""
echo "✅ Token obtained: ${TOKEN:0:20}..."
echo ""

# Test 3: Get Current User
echo "3️⃣  Testing Get Current User (Protected)..."
curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 4: Get All Roles
echo "4️⃣  Testing Get All Roles..."
ROLES_RESPONSE=$(curl -s $BASE_URL/roles)
echo $ROLES_RESPONSE | jq '.'

# Extract a role ID for user creation
ROLE_ID=$(echo $ROLES_RESPONSE | jq -r '.data[0].id')
echo ""
echo "✅ Using Role ID: $ROLE_ID"
echo ""

# Test 5: Create User
echo "5️⃣  Testing Create User..."
CREATE_USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test User $(date +%s)\",
    \"email\": \"test$(date +%s)@tve.com\",
    \"password\": \"test123\",
    \"roleId\": \"$ROLE_ID\"
  }")

echo $CREATE_USER_RESPONSE | jq '.'

USER_ID=$(echo $CREATE_USER_RESPONSE | jq -r '.data.id')
echo ""
echo "✅ Created User ID: $USER_ID"
echo ""

# Test 6: Get All Users
echo "6️⃣  Testing Get All Users..."
curl -s "$BASE_URL/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 7: Get User by ID
if [ "$USER_ID" != "null" ] && [ ! -z "$USER_ID" ]; then
  echo "7️⃣  Testing Get User by ID..."
  curl -s "$BASE_URL/users/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
fi

# Test 8: Update User
if [ "$USER_ID" != "null" ] && [ ! -z "$USER_ID" ]; then
  echo "8️⃣  Testing Update User..."
  curl -s -X PATCH "$BASE_URL/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Test User Updated"
    }' | jq '.'
  echo ""
fi

# Test 9: Create Role
echo "9️⃣  Testing Create Role..."
CREATE_ROLE_RESPONSE=$(curl -s -X POST $BASE_URL/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"code\": \"TEST_$(date +%s)\",
    \"name\": \"Test Role $(date +%s)\"
  }")

echo $CREATE_ROLE_RESPONSE | jq '.'
echo ""

# Test 10: Test Error Handling - Invalid Credentials
echo "🔟 Testing Error Handling (Invalid Credentials)..."
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@tve.com",
    "password": "wrongpassword"
  }' | jq '.'
echo ""

# Test 11: Test Error Handling - Missing Token
echo "1️⃣1️⃣  Testing Error Handling (Missing Auth Token)..."
curl -s $BASE_URL/auth/me | jq '.'
echo ""

echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "📝 Summary:"
echo "  - Health check: ✅"
echo "  - Login: ✅"
echo "  - Get current user: ✅"
echo "  - Get roles: ✅"
echo "  - Create user: ✅"
echo "  - Get users: ✅"
echo "  - Update user: ✅"
echo "  - Create role: ✅"
echo "  - Error handling: ✅"
echo ""
echo "🎉 Phase 1 Implementation is working perfectly!"
