FROM node:20-alpine
WORKDIR /usr/src/app

# Copia todos os arquivos do projeto
COPY . .

# Instala todas as dependências e faz o build
RUN npm install
RUN npm run build

# Expõe a porta e define o comando de inicialização
EXPOSE 4000
CMD ["node", "dist/index.js"]
