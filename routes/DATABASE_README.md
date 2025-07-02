# 💈 Barber Project

Sistema de controle de agendamento de horários para barbearias.  
Desenvolvido com **Vue.js** no frontend e **Node.js** + **Express** no backend.

---

## 🚀 Tecnologias Utilizadas

- ✅ **Vue.js** — Interface do usuário (Frontend)
- ✅ **Node.js** — Ambiente de execução JavaScript no backend
- ✅ **Express.js** — Framework para criação da API REST
- ✅ **PostgreSQL** — Banco de dados relacional
- ✅ **Axios** — Cliente HTTP para o frontend
- ✅ **Dotenv** — Gerenciamento de variáveis de ambiente
- ✅ **JWT** — Autenticação com JSON Web Tokens

---

## 🧩 Funcionalidades

- Cadastro e login de usuários
- Controle de horários disponíveis
- Marcação e cancelamento de agendamentos
- Listagem com paginação de horários e agendamentos
- Controle de permissões para usuários administradores

---

## 📦 Estrutura do Banco de Dados (PostgreSQL)

### 🔹 Tabela `users`

```sql
CREATE TABLE users (
  id_user SERIAL PRIMARY KEY,
  username VARCHAR(50),
  password_user VARCHAR(50),
  adm INTEGER NOT NULL DEFAULT 0
);
```

### 🔹 Tabela `horarios`

```sql
CREATE TABLE horarios (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE,
  id_usuario INTEGER,
  FOREIGN KEY (id_usuario) REFERENCES users(id_user)
);
```
