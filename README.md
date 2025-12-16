# 🧠 BrainBattle – Quiz App

BrainBattle is a full-stack, role-based quiz application built using **React + Vite** for the frontend and **Node.js + Express + MongoDB** for the backend.
It allows admins to create quizzes and users to take quizzes, view scores, and compete on leaderboards.

🔗 **Live Demo:**
[https://brainbattle-nb8x.onrender.com](https://brainbattle-nb8x.onrender.com)

---

## ✨ Features

* 🔐 Login & Signup using **JWT authentication**
* 👥 **Role-based access**

  * **Admin**: Create & delete quizzes, view all results
  * **User**: Take quizzes, view personal scores
* 🧩 Quizzes with multiple questions
* 📝 Instant score calculation
* 🏆 Leaderboard (Top 10 per quiz)
* 📱 Responsive UI (mobile & desktop)

---

## 🛠 Tech Stack

**Frontend**

* React
* Vite
* Axios
* CSS

**Backend**

* Node.js
* Express.js
* MongoDB
* JWT & bcrypt

---

## 📂 Project Structure

### Frontend

```
src/
├── Login.jsx
├── Signup.jsx
├── Quiz.jsx
├── Score.jsx
├── UserDashboard.jsx
├── UserResults.jsx
├── Sidebar.jsx
├── UserHeader.jsx
├── ForgotPassword.jsx
├── api.js
├── App.jsx
├── main.jsx
└── index.css
```

### Backend

```
backend/
├── models/
│   ├── User.js
│   ├── Quiz.js
│   └── Result.js
├── routes/
│   ├── auth.js
│   └── quiz.js
├── middleware/
│   └── auth.js
├── config/
│   └── db.js
├── server.js
└── .env
```

---

## 🔄 How It Works

1. User/Admin signs up or logs in
2. JWT token is generated and stored
3. Admin creates quizzes (6-digit code)
4. Users take quizzes and submit answers
5. Score is calculated and saved
6. Leaderboard shows top performers

---

## ⚙️ Environment Variables (Backend)

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## ▶️ Run Locally

### Clone Repository

```bash
git clone https://github.com/Vishnupriya-TK/BrainBattle.git
cd BrainBattle
```

### Start Backend

```bash
cd backend
npm install
npm start
```

### Start Frontend

```bash
npm install
npm run dev
```

Open browser:
👉 `http://localhost:5173`

---

## 👩‍💻 Author

**Vishnu Priya Kannan**
📬 Open to collaboration and feedback

---

🌟 *“BrainBattle turns knowledge into competition and learning into achievement.”*

