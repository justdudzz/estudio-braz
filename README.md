# 🏛️ Estúdio Braz: Digital Excellence & Elite Management

![Versão](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Uma plataforma de agendamento e gestão (ERP/CRM) de alta performance, desenhada para estúdios de estética de luxo. Focada em **Segurança de Elite**, **Experiência de Utilizador (UX) Premium** e **Soberania Digital**.

---

## 💎 Destaques do Projeto

*   **🎨 Experiência VIP:** Interface imersiva com *Glassmorphism*, gradientes metálicos e animações fluidas (Framer Motion).
*   **🛡️ Fortress Security:** Autenticação de 2 Passos (2FA) via Google Authenticator, Cookies httpOnly (Anti-XSS), Proteção CSRF e Rate Limiting.
*   **🤖 Gestão Inteligente:** Painel administrativo completo com CRM, rastreio de faturação (LTV), controlo de gastos e exportação de dados.
*   **📊 Conversão Máxima:** Fluxo de agendamento otimizado com bloqueio de horários em tempo real e automação de emails.

---

## 🚀 Guia de Ignição

### 1. Pré-requisitos
*   Node.js (v18+)
*   Docker & Docker Compose (para a base de dados)

### 2. Configuração do Ambiente
Crie os ficheiros `.env` seguindo os modelos:

**No diretório `./backend/.env`:**
```env
PORT=3001
JWT_SECRET=sua_chave_mestra_ultra_secreta
DATABASE_URL="postgresql://user:password@localhost:5432/studio_braz?schema=public"
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
NODE_ENV=development
```

**No diretório `./projeto-estudio/.env`:**
```env
VITE_API_URL=http://localhost:3001
```

### 3. Instalação & Execução
```bash
# Na raiz do projeto
npm install           # Instala dependências globais
docker-compose up -d  # Liga a base de dados PostgreSQL

# Iniciar o ecossistema (Frontend + Backend)
npm run dev
```

---

## 🏗️ Estrutura do Sistema

```text
├── backend/               # Motor Node.js + Express + Prisma
│   ├── prisma/            # Schema e Migrações da DB
│   ├── src/controllers/   # Lógica de Negócio (Auth, Bookings, Clients)
│   └── src/routes/        # Endpoints da API v1
├── projeto-estudio/       # Interface React + Vite
│   ├── components/        # UI de Luxo & Admin Dashboard
│   ├── src/services/      # Conetores com a API
│   └── contexts/          # Gestão de Estado Global (Auth & Data)
└── README.md              # Este manual
```

---

## 🛡️ Camadas de Segurança (Nível Bancário)

1.  **JWT Soberano:** Tokens assinados com validade de 30 dias, geridos via Cookies seguros.
2.  **TOTP (2FA):** Proteção do Diretor com chaves dinâmicas geradas no telemóvel.
3.  **Bcrypt Military:** Hashing de passwords que garante que ninguém (nem os devs) sabe a password real.
4.  **CORS & Helmet:** Blindagem contra injeção de scripts e acessos não autorizados.
5.  **Zod Guard:** Cada bit de informação é validado antes de tocar na base de dados.

---

## 🛠️ Tech Stack Superior

*   **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend:** Node.js, Express, TypeScript, Prisma ORM.
*   **Infra:** Docker (PostgreSQL), Nodemailer (Automação de Emails).

---

## 📜 Licença & Autor
Este projeto é propriedade intelectual do **Estúdio Braz**. Desenvolvido para representar o pico da gestão estética digital em 2026.

---
*Forjado para dominar. Sob o controlo total do Diretor.*