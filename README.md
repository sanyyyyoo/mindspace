# 🧠 Mindspace

AI-powered productivity journaling and analytics platform built with React, Node.js, Supabase, and Groq AI.

---
project url=https://mindspace-eight-ruddy.vercel.app/

# 🚀 Overview

Mindspace helps users track their daily productivity through AI-analyzed journal entries. Users can write journals, receive intelligent productivity insights, monitor streaks, unlock rewards, and visualize progress through an interactive analytics dashboard.

The platform includes:

* Secure authentication using Supabase Auth
* AI-generated productivity analysis
* User-specific dashboards and analytics
* Streak and reward system
* Interactive charts and insights
* Fully deployed backend and frontend
* Docker support for containerized deployment

---

# ✨ Features

## 🔐 Authentication

* User signup and login using Supabase
* Protected routes
* JWT-based API authentication
* Persistent sessions

## 📝 AI Journal Analysis

* Daily productivity journal entries
* AI-generated:

  * Productivity score
  * Summary
  * Feedback
  * Category detection
* Powered by Groq API
  <img width="1167" height="782" alt="image" src="https://github.com/user-attachments/assets/c35e3545-920d-4bda-9dc4-49a90d19da5d" />


## 📊 Dashboard Analytics

* Productivity trend graphs
* Weekly AI reflection
* Category analytics
* Productivity averages
* Streak tracking
* Consistency tracking

<img width="1274" height="782" alt="image" src="https://github.com/user-attachments/assets/e2ebc7d7-c709-40de-ad14-14a08d10c1da" />

<img width="1340" height="744" alt="image" src="https://github.com/user-attachments/assets/192ab557-80fa-4956-ab1e-104e794c3fbd" />

## 🏆 Rewards System

* Unlockable achievements
* Productivity milestones
* Streak-based rewards

## 📱 Responsive UI

* Tailwind CSS styling
* Responsive dashboard layout
* Modern dark theme

## 🐳 Docker Support

* Dockerized backend
* Production-ready deployment setup

---


# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* Recharts

## Backend
backend url=https://mindspace-j7br.onrender.com

* Node.js
* Express.js
* Groq SDK

## Database & Auth

* Supabase
* PostgreSQL
* Supabase Authentication

## Deployment

* Render (Backend)
* Vercel (Frontend)
* Docker

---

# 📂 Project Structure

```bash
mindspace/
│
├── backend/
│   ├── middleware/
│   ├── index.js
│   ├── Dockerfile
│   └── package.json
│
├── my-app/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── supabase/
│   └── sql/
│
└── README.md
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
PORT=3000
```

## Frontend `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

---

# 🚀 Local Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/sanyyyyoo/mindspace.git
cd mindspace
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on:

```bash
http://localhost:3000
```

---

## 3️⃣ Frontend Setup

```bash
cd my-app
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🐳 Docker Setup

## Build Docker Image

```bash
docker build -t mindspace-backend .
```

## Run Container

```bash
docker run -p 3000:3000 \
-e GROQ_API_KEY=your_groq_key \
-e SUPABASE_URL=your_supabase_url \
-e SUPABASE_KEY=your_supabase_key \
mindspace-backend
```

---

# ☁️ Deployment

## Backend Deployment (Render)

### Root Directory

```bash
backend
```

### Build Command

```bash
npm install
```

### Start Command

```bash
node index.js
```

### Environment Variables

```env
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
PORT=3000
```

---

## Frontend Deployment (Vercel)

### Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

---

# 🔒 Security Features

* JWT verification middleware
* User-scoped API access
* Protected frontend routes
* Environment variable protection
* Secure Supabase authentication
* CORS configuration

---

# 📈 Future Improvements

* Edit journals
* Search and filter journals
* Push notifications
* Dark/light mode toggle
* AI habit recommendations
* React Native mobile app
* Calendar heatmap
* Advanced analytics

---

# 📸 Screenshots

Add screenshots of:

* Login page
* Dashboard
* Journal input
* Rewards section
* Analytics graphs

---

# 👨‍💻 Author

Simran

GitHub:

[https://github.com/sanyyyyoo](https://github.com/sanyyyyoo)

---

# 📄 License

This project is licensed for educational and portfolio purposes.
