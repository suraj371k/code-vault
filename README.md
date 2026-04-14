#  Code Vault – AI Powered Code Snippet Platform

A full-stack multi tenant **Code Snippet Management Platform** built using the **PERN stack with TypeScript**.  
Users can authenticate , create organizations , add members inside organization, create code snippets, generate AI-powered summaries, and store everything securely in the database.

Deployed using Docker containers on Render with CI/CD via GitHub Actions.

---

##  Features

-    User Authentication (JWT-based)
-    Added multi tenant feature so user can create there own organization and add team members
-    Create and manage code snippets
-    AI-powered code summarization
-    Personalize chat-bot for each snippets
-    Real Time chat feature with socket.io (personal and group)
-    Dockerized backend
-    CI/CD pipeline with GitHub Actions
-    Deployment on Render
-    Database hosted on Supabase (PostgreSQL)

---

## 🏗 Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Redis for caching

### Frontend
- Next.js
- TypeScript
- Shadcn UI
- Tailwind CSS

### DevOps
- Docker
- GitHub Actions
- Render

---

##  Authentication Flow

1. User registers with email & password or login with google
2. Password is securely hashed
3. JWT token is generated upon login
4. Token is required for protected routes
5. Authenticated user can create and manage snippets

---

## Organization Flow
1. When user signup default organization will created
2. users can create other organizations as well
3. organization owner can add other member
4. organization owner can manage user
5. members inside the organization can chat with other members in real time


##  Snippet Creation Flow

1. Authenticated user submits:
   - Title
   - Programming language
   - Code content
2. Backend validates request
3. Snippet is stored in PostgreSQL
4. Linked to the authenticated user
5. Integated Redis for snippet caching
6. Added realtime feature using socket.io

---

##  AI Summarization Flow

1. User submits a code snippet
2. Backend sends code to AI service
3. AI generates a concise summary
4. Summary is returned to user
5. Summary is saved in database along with snippet

---
## Personalize chat-bot for each snippet
1. User can ask question about specific snippet
2. integrated gemini with langchain.
3. streaming support


## Real Time Chat Feature

1. User joined organization
2. Chat with organization members
3. Can create group
4. group is visible only to only member of the group

## Notification Feature
1. When new user or snippt will create user inside organization get notification in real time
2. added redis caching for notifications

##Payment Integration
1. Uses stripe for payment integration
2. monthly and yearly plans are avaialable

