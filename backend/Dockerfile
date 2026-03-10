# 🏛️ STUDIO BRAZ - DOCKER RUNTIME
# Imagem de base estável e leve (Elite Performance)
FROM node:18-alpine

# Criar diretório do sistema
WORKDIR /usr/app

# Instalar dependências globais
RUN apk add --no-cache openssl

# Copiar ficheiros de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências (limpo para produção)
RUN npm install

# Copiar o resto do código
COPY . .

# Gerar o cliente Prisma para produção
RUN npx prisma generate

# Construir o projeto (TypeScript -> JS)
RUN npm run build

# Expor a porta do servidor
EXPOSE 5000

# Comando de arranque de elite
CMD ["npm", "start"]
