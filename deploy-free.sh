#!/bin/bash

echo "🚀 Deploy ChatFlow - Versão Free Tier"
echo "======================================"

# Verificar se o repositório está conectado ao GitHub
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este diretório não é um repositório Git"
    echo "Execute: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

echo "📋 Checklist de Deploy Free Tier:"
echo ""

echo "1. ✅ MongoDB Atlas (Free Tier)"
echo "   - Crie conta em: https://cloud.mongodb.com"
echo "   - Cluster M0 Sandbox (512MB)"
echo "   - Configure usuário e senha"
echo "   - Obtenha connection string"
echo ""

echo "2. ✅ Render (Free Tier)"
echo "   - Conecte repositório GitHub"
echo "   - Deploy via Blueprint (render.yaml)"
echo "   - Configure MONGODB_URL manualmente"
echo ""

echo "3. ✅ Vercel (Free Tier)"
echo "   - Deploy frontend"
echo "   - Configure variáveis de ambiente"
echo ""

echo "🔧 Comandos para Deploy:"
echo ""

echo "# 1. Deploy no Render:"
echo "   - Vá para: https://dashboard.render.com"
echo "   - New → Blueprint"
echo "   - Conecte seu repositório"
echo "   - Clique em 'Apply'"
echo ""

echo "# 2. Configure MongoDB no Render:"
echo "   - Vá para chatflow-message-service"
echo "   - Environment → Environment Variables"
echo "   - Adicione: MONGODB_URL=sua_connection_string"
echo ""

echo "# 3. Deploy Frontend na Vercel:"
echo "cd frontend"
echo "vercel --prod"
echo ""

echo "# 4. Configure variáveis no Frontend:"
echo "   - Vercel Dashboard → Settings → Environment Variables"
echo "   - NEXT_PUBLIC_WEBSOCKET_URL=https://chatflow-websocket-gateway.onrender.com"
echo "   - NEXT_PUBLIC_API_URL=https://chatflow-auth-service.onrender.com"
echo "   - NEXT_PUBLIC_MESSAGE_API_URL=https://chatflow-message-service.onrender.com"
echo ""

echo "💰 Custos Free Tier:"
echo "   - Render: $0/mês (750 horas/mês)"
echo "   - Vercel: $0/mês (100GB bandwidth)"
echo "   - MongoDB Atlas: $0/mês (512MB storage)"
echo ""

echo "⚠️  Limitações Free Tier:"
echo "   - Render: serviços hibernam após inatividade"
echo "   - MongoDB: 512MB storage"
echo "   - Redis: 25MB storage, sem persistência"
echo "   - PostgreSQL: 1GB storage, hiberna após 90 dias"
echo ""

echo "🎯 Próximos Passos:"
echo "1. Configure MongoDB Atlas"
echo "2. Deploy no Render"
echo "3. Deploy na Vercel"
echo "4. Teste a aplicação"
echo ""

echo "📞 Precisa de ajuda? Verifique os arquivos:"
echo "   - docs/mongodb-setup.md"
echo "   - docs/postgres-setup.md"
echo "   - docs/redis-setup.md" 