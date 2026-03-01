# 🚀 Code Vault – AI Powered Code Snippet Platform

A full-stack **Code Snippet Management Platform** built using the **PERN stack with TypeScript**.  
Users can authenticate, create code snippets, generate AI-powered summaries, and store everything securely in the database.

Deployed using Docker containers on Render with CI/CD via GitHub Actions.

---

## 🧠 Features

- 🔐 User Authentication (JWT-based)
- ✍️ Create and manage code snippets
- 🤖 AI-powered code summarization
- 💾 Save snippets and summaries in PostgreSQL
- 🐳 Dockerized backend
- 🚀 CI/CD pipeline with GitHub Actions
- ☁️ Deployment on Render
- 🗄 Database hosted on Supabase (PostgreSQL)

---

## 🏗 Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)

### Frontend
- React
- TypeScript

### DevOps
- Docker
- GitHub Actions
- Render

---

## 🔐 Authentication Flow

1. User registers with email & password
2. Password is securely hashed
3. JWT token is generated upon login
4. Token is required for protected routes
5. Authenticated user can create and manage snippets

---

## ✍️ Snippet Creation Flow

1. Authenticated user submits:
   - Title
   - Programming language
   - Code content
2. Backend validates request
3. Snippet is stored in PostgreSQL
4. Linked to the authenticated user

---

## 🤖 AI Summarization Flow

1. User submits a code snippet
2. Backend sends code to AI service
3. AI generates a concise summary
4. Summary is returned to user
5. Summary is saved in database along with snippet

---


## Work In progress...
