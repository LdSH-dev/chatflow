#!/bin/bash

echo "🔐 Testando fluxo de autenticação..."
echo ""

AUTH_URL="http://localhost:3001/api/auth"

# Test registration
echo "1. Testando registro de usuário..."
REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }')

echo "Resposta do registro:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extract token from registration
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Token obtido com sucesso"
    
    # Test profile endpoint
    echo "2. Testando endpoint de perfil com token..."
    PROFILE_RESPONSE=$(curl -s -X GET "$AUTH_URL/profile" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Resposta do perfil:"
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
    echo ""
    
    if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Autenticação funcionando corretamente"
    else
        echo "❌ Problema na validação do token"
    fi
else
    echo "❌ Falha ao obter token no registro"
    
    # Try login instead
    echo "3. Tentando login com usuário existente..."
    LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@example.com",
        "password": "123456"
      }')
    
    echo "Resposta do login:"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

echo ""
echo "🔍 Para testar manualmente:"
echo "1. Abra http://localhost:3000"
echo "2. Cadastre um novo usuário ou faça login"
echo "3. Verifique se redireciona para a tela principal após sucesso"