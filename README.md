# Bullworth RP — Site + Loja de Bully Points

Base inicial do projeto com:
- React + TypeScript + Vite
- Node.js + Express + TypeScript
- MySQL + Prisma ORM 7
- Discord OAuth2
- Validação de membro pelo servidor do Discord via Bot Token
- Funções de Home, Loja, Perfil e Admin
- Bully Points, produtos, compras e histórico de transações

## 1. Pré-requisitos
- Node.js compatível com Prisma 7
- MySQL/MariaDB
- Aplicação criada no Discord Developer Portal
- Bot adicionado ao servidor do RP

## 2. Instalar dependências
Na raiz:

```bash
npm install
```

## 3. Configurar variáveis de ambiente
Copie:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

No Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Preencha as credenciais do MySQL e do Discord.

## 4. Banco de dados
Crie uma base chamada `bully_rp`, depois:

```bash
npm run prisma:generate -w @bully-rp/api
npm run prisma:migrate -w @bully-rp/api -- --name init
```

## 5. Discord Developer Portal
No OAuth2, cadastre a Redirect URL:

`http://localhost:3001/api/auth/discord/callback`

Preencha no `.env`:
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_GUILD_ID`
- `DISCORD_BOT_TOKEN`
- `DISCORD_ADMIN_ROLE_ID` (ID do cargo que dará acesso ao painel Admin)

O bot precisa estar no servidor para a API conseguir consultar `/guilds/{guild_id}/members/{user_id}`.

## 6. Rodar localmente
Abra dois terminais:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Acesse `http://localhost:5173`.

## Próximas etapas
1. Finalizar compra no frontend chamando `POST /api/products/:id/buy`.
2. Criar painel Admin real com estatísticas, produtos e gerenciamento de pontos.
3. Adicionar histórico de compras e transações ao perfil.
4. Criar seed com produtos de exemplo.
5. Configurar deploy: Vercel (frontend) + Railway (API/MySQL).
