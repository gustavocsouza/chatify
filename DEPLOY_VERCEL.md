# Guia de Deploy no Vercel - Chatify

## Pré-requisitos
- Conta no [Vercel](https://vercel.com) (integrado com seu GitHub)
- Repositório GitHub público
- URLs corretas de suas services (MongoDB, Resend, Cloudinary, Arcjet)

## Passo 1: Preparar o Repositório

1. Commit e push de todos os arquivos para GitHub:
```bash
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

## Passo 2: Configurar no Vercel Dashboard

1. Acesse [vercel.com](https://vercel.com) e clique "Add New" → "Project"
2. Selecione seu repositório (chatify)
3. Configure as variáveis de ambiente:

**Variáveis necessárias:**

```
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/chatify
JWT_SECRET=sua_chave_secreta_JWT
RESEND_API_KEY=sua_chave_API_Resend
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify
CLIENT_URL=https://seu-app.vercel.app
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
ARCJET_KEY=sua_chave_Arcjet
ARCJET_ENV=production
```

## Passo 3: Deploy

1. Na dashboard do Vercel, clique em "Deploy"
2. Aguarde a conclusão do build (normalmente 2-5 minutos)
3. Você receberá uma URL pública (ex: `seu-app.vercel.app`)

## Passo 4: Atualizar URLs no Frontend

Após o deploy, atualize a URL do backend no frontend:

1. Em `frontend/.env`:
```
VITE_API_URL=https://seu-app.vercel.app
```

2. Atualize o arquivo `frontend/lib/axios.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});
```

## Passo 5: Configurar Domínio (Opcional)

1. Na dashboard do Vercel, vá para "Settings" → "Domains"
2. Adicione seu domínio customizado
3. Atualize os registros DNS conforme instruído

## Possíveis Problemas e Soluções

### Socket.io não funciona
- Vercel suporta WebSockets, mas pode ser necessário usar polling como fallback
- No seu arquivo socket, considere adicionar:
```javascript
import { Server } from 'socket.io';

const io = new Server({
  transports: ['polling', 'websocket']
});
```

### Variáveis de ambiente não carregam
- Verifique se todas as variáveis estão configuradas no dashboard do Vercel
- Reinicie o deployment: Settings → Deployments → Redeploy

### Frontend não encontra o backend
- Certifique-se que `CLIENT_URL` no backend aponta para seu domínio Vercel
- Verifique CORS está configurado corretamente no backend

### MongoDB ou outras services dão erro
- Verifique se seus IPs estão permitidos nas respectivas plataformas
- Para MongoDB Atlas: Add IP Address = 0.0.0.0/0 (menos seguro) ou permitir Vercel IPs

## Próximos Passos

1. Configure GitHub Actions para CI/CD automático
2. Configure domínio customizado
3. Configure SSL/TLS automático (Vercel faz por padrão)
4. Monitore logs no dashboard do Vercel

## Comandos Úteis

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy local
vercel

# Preview do deploy
vercel -preview

# Produção
vercel --prod
```
