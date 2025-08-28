# 🚀 Deploy ChatFlow - Versão Free Tier

Este guia te ajudará a fazer o deploy da aplicação ChatFlow usando apenas serviços gratuitos.

## 📋 Pré-requisitos

- Conta no GitHub
- Conta na Vercel (gratuita)
- Conta no Render (gratuita)
- Conta no MongoDB Atlas (gratuita)

## 🗄️ Bancos de Dados (Free Tier)

### 1. MongoDB Atlas (Message Service)
- **Custo**: $0/mês
- **Limite**: 512MB storage
- **Configuração**: [docs/mongodb-setup.md](docs/mongodb-setup.md)

### 2. PostgreSQL (Auth Service)
- **Custo**: $0/mês
- **Limite**: 1GB storage
- **Configuração**: Automática no Render

### 3. Redis (Cache/Sessões)
- **Custo**: $0/mês
- **Limite**: 25MB storage
- **Configuração**: Automática no Render

## 🏗️ Deploy Backend (Render)

### Passo 1: Preparar Repositório
```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Prepare for free tier deploy"
git push origin main
```

### Passo 2: Deploy no Render
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New" → "Blueprint"
3. Conecte seu repositório GitHub
4. Clique em "Apply"

O `render.yaml` já está configurado para:
- Criar todos os serviços automaticamente
- Configurar PostgreSQL e Redis
- Usar planos gratuitos

### Passo 3: Configurar MongoDB
1. Vá para o serviço `chatflow-message-service`
2. Environment → Environment Variables
3. Adicione: `MONGODB_URL` = sua connection string do MongoDB Atlas

## 🎨 Deploy Frontend (Vercel)

### Passo 1: Deploy
```bash
cd frontend
vercel --prod
```

### Passo 2: Configurar Variáveis
No Vercel Dashboard:
- `NEXT_PUBLIC_WEBSOCKET_URL` = `https://chatflow-websocket-gateway.onrender.com`
- `NEXT_PUBLIC_API_URL` = `https://chatflow-auth-service.onrender.com`
- `NEXT_PUBLIC_MESSAGE_API_URL` = `https://chatflow-message-service.onrender.com`

## 🔧 URLs dos Serviços

Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.vercel.app`
- **Auth Service**: `https://chatflow-auth-service.onrender.com`
- **Message Service**: `https://chatflow-message-service.onrender.com`
- **WebSocket**: `https://chatflow-websocket-gateway.onrender.com`
- **Delivery Service**: `https://chatflow-delivery-service.onrender.com`
- **Presence Service**: `https://chatflow-presence-service.onrender.com`

## ⚠️ Limitações Free Tier

### Render
- Serviços hibernam após inatividade
- 750 horas/mês de runtime
- Sem SSL customizado
- Sem domínios customizados

### Vercel
- 100GB bandwidth/mês
- Sem analytics avançado
- Sem preview deployments ilimitados

### MongoDB Atlas
- 512MB storage
- Sem backups automáticos
- Sem monitoring avançado

## 🚨 Problemas Comuns

### Serviços Hibernando
- Render hiberna serviços gratuitos após inatividade
- Primeira requisição pode demorar 30-60 segundos
- Considere usar um serviço de "ping" para manter ativo

### CORS Issues
Se encontrar problemas de CORS:
```javascript
// Adicione no backend
app.use(cors({
  origin: ['https://seu-dominio.vercel.app'],
  credentials: true
}));
```

### WebSocket Connection
- Verifique se as URLs estão corretas
- Teste a conexão WebSocket separadamente
- Verifique se o serviço não está hibernando

## 💰 Upgrade para Produção

Para uma aplicação em produção, considere:
- **Render**: Plano Starter ($7/mês) - sem hibernação
- **MongoDB Atlas**: M2 ($9/mês) - 2GB storage
- **Vercel**: Pro ($20/mês) - mais bandwidth e features

## 🎯 Próximos Passos

1. ✅ Configure MongoDB Atlas
2. ✅ Deploy no Render
3. ✅ Deploy na Vercel
4. ✅ Teste a aplicação
5. ✅ Configure domínios customizados (opcional)

## 📞 Suporte

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

---

**💡 Dica**: Execute `./deploy-free.sh` para ver um resumo completo do processo! 