# syntax=docker/dockerfile:1
# LOTORIUM LABS: visualização exclusiva do CRM, sem acesso a sessões locais.

# ---------------------------------------------------------------------------------------------
# Estágio 1: compila o cliente (Vite) e empacota o servidor (esbuild) em dist/.
# ---------------------------------------------------------------------------------------------
# A imagem base fica presa pelo digest (o mesmo nos dois estágios), para o build ser reproduzível; o Dependabot
# (.github/dependabot.yml, ecossistema docker) troca a tag e o digest juntos quando sai versão nova.
FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS builder
WORKDIR /app

# Dependências primeiro: a camada fica em cache enquanto o lockfile não mudar.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------------------------
# Estágio 2: runtime enxuto. O servidor não tem dependências de runtime (só módulos node:*),
# então basta o dist/ e o package.json (nome, versão e "type": "module").
# ---------------------------------------------------------------------------------------------
FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS runtime

ENV NODE_ENV=production \
    LOTORIUM_LABS_HOST=0.0.0.0 \
    LOTORIUM_LABS_PORT=4747

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Processo sem privilégios; o cenário não precisa escrever dados locais.
USER node

EXPOSE 4747

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4747/api/health',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]

CMD ["node", "dist/server/index.js"]
