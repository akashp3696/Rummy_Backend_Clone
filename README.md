# Rummy_Backend_Clone
🎮 Real-Time Card Game Backend (Node.js)

A Node.js + Socket.IO based real-time multiplayer card game backend focused on game logic, socket management, and scalable architecture.

⚠️ This is a portfolio/demo codebase.
Real-money payments, production secrets, and sensitive integrations are intentionally removed or mocked.

🚀 Tech Stack

Node.js

Express.js

MongoDB (Mongoose)

Socket.IO

JWT Authentication

REST APIs

📦 Features

Real-time multiplayer gameplay

Socket.IO namespace-based architecture

Room & table management

Turn-based game engine

User & admin role separation

Scalable backend structure

Security-first design

🌐 API Routes
User & Admin
/api/user
/api/admin

Game Management
/api/game

Settings & Content
/api/setting
/api/banner

Transactions (Demo / Mocked)
/api/payment
/api/fund
/api/withdrawal
/api/transaction


💡 Payment and fund-related routes are non-production and included only to demonstrate backend architecture.

🔌 Socket.IO Namespaces
Point Practice Game
/point-practice

Deal Practice Game
/deal-practice

Pool Practice Game
/pool-practice


Each namespace handles:

Player connections

Game state sync

Turn management

Join/leave events

🗄️ Database

MongoDB with Mongoose schemas

Schemas include:

User

Admin

Room

Table

Game

No real data included

🔐 Security

JWT-based authentication

Environment variables for secrets

.env excluded from repository

No production credentials included

▶️ Run Locally
npm install
npm run dev


Server runs on:

http://localhost:8080

📌 Disclaimer

This project is built for learning and portfolio purposes only.
Real-money gaming logic and payment gateway integrations are intentionally excluded.

👨‍💻 Author

Akash
Backend / MERN Developer
Specialized in real-time systems & Socket.IO

⭐ Highlights

Advanced Socket.IO usage

Clean backend architecture

Real-world multiplayer game logic

Resume-grade backend project