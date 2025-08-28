#!/bin/bash

echo "🧪 Testando serviços do ChatFlow..."
echo ""

services=(
    "Auth Service:http://localhost:3001/health"
    "Message Service:http://localhost:3002/health"
    "Delivery Service:http://localhost:3003/health"
    "Presence Service:http://localhost:3004/health"
    "WebSocket Gateway:http://localhost:4000/health"
)

all_healthy=true

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    url=$(echo $service | cut -d: -f2-)
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /tmp/response.json)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        status=$(cat /tmp/response.json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$status" = "OK" ]; then
            echo "✅ Healthy"
        else
            echo "❌ Unhealthy (status: $status)"
            all_healthy=false
        fi
    else
        echo "❌ Failed (HTTP $http_code)"
        all_healthy=false
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    echo "🎉 Todos os serviços estão funcionando corretamente!"
    echo ""
    echo "📱 Abra seu navegador em: http://localhost:3000"
    echo ""
    echo "🔧 Para ver logs em tempo real:"
    echo "   docker compose logs -f"
    echo ""
    echo "📊 Para ver estatísticas dos containers:"
    echo "   docker compose ps"
else
    echo "⚠️  Alguns serviços não estão funcionando corretamente."
    echo "   Execute: docker compose logs -f para ver os logs"
fi

rm -f /tmp/response.json