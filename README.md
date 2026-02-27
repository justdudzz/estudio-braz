# 🏛️ Fortaleza Digital: Studio Braz

Este repositório contém o código-fonte soberano do **Studio Braz**, uma plataforma de agendamento e gestão de estética de elite para 2026. 

Desenhado para operar com **zero dependência** de serviços externos de agenda (como Google Calendar ou Netlify Functions), garantindo privacidade absoluta e controlo total dos dados (Soberania Digital).

## 🏗️ Arquitetura do Império

O projeto está dividido em três pilares:

1. **A Face (Frontend):** React + Vite + TailwindCSS. Interface de luxo, otimizada para SEO e conversão máxima. Localizado na pasta `/projeto-estudio`.
2. **O Cérebro (Backend):** Node.js + Express. Valida agendamentos, encripta acessos e protege as rotas. Localizado na pasta `/backend`.
3. **A Memória (Base de Dados):** MongoDB via Docker. O cofre-forte local onde os dados das clientes VIP residem. 

## 🚀 Manual de Ignição (Como Ligar a Fortaleza)

Sempre que o servidor for reiniciado, siga estes passos para colocar o Studio Braz online:

### Passo 1: Acordar a Memória (Docker)
Certifique-se de que o Docker Desktop está aberto. No terminal, execute:
\`\`\`bash
docker start studio-braz-db
\`\`\`
*(Nota: Se for a primeiríssima vez, o comando de criação é: `docker run -d -p 27017:27017 --name studio-braz-db mongo:latest`)*

### Passo 2: O Botão de Ignição
Na pasta raiz do projeto (`MyProject`), execute o comando mestre que liga o Backend e o Frontend simultaneamente:
\`\`\`bash
npm run dev
\`\`\`

### Passo 3: Aceder aos Painéis
- **Site Público:** [http://localhost:5173](http://localhost:5173)
- **Sala de Comando (Diretor):** [http://localhost:5173/login](http://localhost:5173/login)
- **Área VIP (Clientes):** [http://localhost:5173/vip](http://localhost:5173/vip)

## 🛡️ Segurança de Elite
* **JWT (JSON Web Tokens):** Garante que apenas o Diretor acede à `/api/v1/bookings`.
* **Bcrypt:** Encriptação militar das palavras-passe no MongoDB.
* **Helmet & CORS:** Proteção do servidor contra ataques web.

---
*Forjado para a excelência. Sob o comando exclusivo do Diretor.*