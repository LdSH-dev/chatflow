# Configuração Redis (Render Free Tier)

## O Redis já está configurado no render.yaml!

### O que acontece automaticamente:
1. Render cria um Redis gratuito
2. A connection string é gerada automaticamente
3. Todos os serviços se conectam automaticamente

### Configuração no render.yaml:
```yaml
databases:
  - name: chatflow-redis
    type: redis
```

### Limitações do Free Tier:
- 25MB de armazenamento
- 20 conexões simultâneas
- Sem persistência de dados
- Pode hibernar após inatividade

### Para verificar a connection string:
1. Vá para o Dashboard do Render
2. Clique no Redis "chatflow-redis"
3. Vá em "Connections"
4. Copie a "External Redis URL"

### Connection String será algo como:
```
redis://redistogo:password@ec2-xxx-xxx-xxx.compute-1.amazonaws.com:12345
```

### Importante:
- Dados são perdidos quando o serviço reinicia
- Para produção, considere upgrade para plano pago
- Ideal para cache temporário e sessões 