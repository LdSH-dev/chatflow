#!/bin/bash

echo "🚀 Iniciando ChatFlow MVP..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose."
    exit 1
fi

echo "📦 Construindo containers..."
docker compose build

echo "🗄️ Iniciando bancos de dados..."
docker compose up -d mongodb postgres redis

echo "⏳ Aguardando bancos de dados ficarem prontos..."
sleep 10

echo "🔧 Iniciando serviços backend..."
docker compose up -d auth-service message-service delivery-service presence-service websocket-gateway

echo "⏳ Aguardando serviços backend ficarem prontos..."
sleep 5

echo "🎨 Iniciando frontend..."
docker compose up -d frontend

echo "✅ Todos os serviços foram iniciados!"
echo ""
echo "📋 URLs disponíveis:"
echo "   Frontend: http://localhost:3000"
echo "   WebSocket Gateway: http://localhost:4000"
echo "   Auth Service: http://localhost:3001"
echo "   Message Service: http://localhost:3002"
echo "   Delivery Service: http://localhost:3003"
echo "   Presence Service: http://localhost:3004"
echo ""
echo "🔍 Para ver logs: docker compose logs -f"
echo "🛑 Para parar: docker compose down"
echo ""
echo "🎉 ChatFlow está pronto para uso!"