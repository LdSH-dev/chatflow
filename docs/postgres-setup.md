# Configuração PostgreSQL (Render Free Tier)

## O PostgreSQL já está configurado no render.yaml!

### O que acontece automaticamente:
1. Render cria um banco PostgreSQL gratuito
2. A connection string é gerada automaticamente
3. O Auth Service se conecta automaticamente

### Configuração no render.yaml:
```yaml
databases:
  - name: chatflow-postgres
    databaseName: chatflow
    user: chatflow
```

### Limitações do Free Tier:
- 1GB de armazenamento
- 90 dias de retenção
- Sem backups automáticos
- Pode hibernar após inatividade

### Para verificar a connection string:
1. Vá para o Dashboard do Render
2. Clique no banco "chatflow-postgres"
3. Vá em "Connections"
4. Copie a "External Database URL"

### Connection String será algo como:
```
postgresql://chatflow:password@dpg-xxxxx-a.oregon-postgres.render.com/chatflow
```

### Importante:
- O banco hiberna após 90 dias de inatividade
- Para produção, considere upgrade para plano pago
- Faça backups manuais regularmente 