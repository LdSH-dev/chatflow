# Configuração MongoDB Atlas (Free Tier)

## Passo a Passo

### 1. Criar Conta
- Acesse [MongoDB Atlas](https://cloud.mongodb.com)
- Clique em "Try Free"
- Crie uma conta ou faça login

### 2. Criar Cluster
- Escolha "Shared" (Free Tier)
- Selecione "M0 Sandbox" (512MB)
- Escolha o provedor (AWS, Google Cloud, ou Azure)
- Escolha a região mais próxima do Brasil
- Clique em "Create"

### 3. Configurar Segurança
- **Database Access:**
  - Clique em "Database Access"
  - "Add New Database User"
  - Username: `chatflow_user`
  - Password: `sua_senha_segura`
  - Role: "Read and write to any database"
  - Clique em "Add User"

- **Network Access:**
  - Clique em "Network Access"
  - "Add IP Address"
  - Clique em "Allow Access from Anywhere" (0.0.0.0/0)
  - Clique em "Confirm"

### 4. Obter Connection String
- Clique em "Connect"
- Escolha "Connect your application"
- Copie a connection string
- Substitua `<password>` pela senha criada
- Substitua `<dbname>` por `chatflow`

### Connection String Final:
```
mongodb+srv://chatflow_user:sua_senha_segura@cluster0.xxxxx.mongodb.net/chatflow?retryWrites=true&w=majority
```

### 5. Configurar no Render
- Vá para o serviço `chatflow-message-service`
- Environment Variables
- Adicione: `MONGODB_URL` = connection string acima 