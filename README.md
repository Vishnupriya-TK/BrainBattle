
# 🧠 BrainBattle – Quiz App

BrainBattle is a full-stack, role-based quiz application built using **React + Vite** for the frontend and **Node.js + Express + MongoDB** for the backend.

It allows admins to create quizzes and users to take quizzes, view scores, compete on leaderboards, and ensures secure quiz monitoring with fullscreen enforcement.

🔗 **Live Demo:**
[https://brainbattle-nb8x.onrender.com](https://brainbattle-nb8x.onrender.com)

---

# ✨ Features

### 🔐 Authentication & Security

* Login & Signup using **JWT authentication**
* Password hashing with bcrypt
* Protected routes using middleware

### 👥 Role-Based Access

**Admin**

* Create quizzes
* Delete quizzes
* View all quiz results
* Monitor leaderboard performance

**User**

* Take quizzes
* View personal scores
* Compete on leaderboard
* Export results as PDF

---

# 🧩 Quiz Features

* Multiple-choice questions
* 6-digit unique quiz code
* Instant score calculation
* Result stored in MongoDB
* Top 10 leaderboard per quiz
* Responsive UI (Mobile + Desktop)

---

# 🖥 Advanced Proctoring Features

### 🔲 Fullscreen Mode Enforcement

* Quiz automatically enters fullscreen mode when started.

### 🚫 Tab Switch Detection

* If the user switches to another application or browser tab:

  * The quiz is automatically terminated.
  * Attempt is marked as completed.
  * Score is calculated based on answered questions.

### 📄 Export Result as PDF

* After quiz completion, users can:

  * Download their result
  * Export score report as PDF
  * Share performance proof

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* Axios
* CSS
* Fullscreen API
* Visibility API
* jsPDF (for PDF export)

## Backend

* Node.js
* Express.js
* MongoDB
* JWT
* bcrypt

---

# 📂 Project Structure

## Frontend

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

## Backend

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

# 🔄 Complete Working Flow

1️⃣ User/Admin signs up or logs in
2️⃣ JWT token is generated and stored
3️⃣ Admin creates quiz with 6-digit code
4️⃣ User enters quiz code
5️⃣ Quiz starts in fullscreen mode
6️⃣ If user switches tab → quiz auto-submits
7️⃣ Score is calculated instantly
8️⃣ Result stored in database
9️⃣ Leaderboard updates
🔟 User can download result as PDF

---

# ⚙️ Environment Variables (Backend)

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

# ▶️ Run Locally

## Clone Repository

```bash
git clone https://github.com/Vishnupriya-TK/BrainBattle.git
cd BrainBattle
```

## Start Backend

```bash
cd backend
npm install
npm start
```

## Start Frontend

```bash
npm install
npm run dev
```

Open browser:
👉 [http://localhost:5173](http://localhost:5173)

---

# 👩‍💻 Author

**Vishnu Priya Kannan**
Full Stack Developer
Open to collaboration and feedback

---


🌟 *“BrainBattle turns knowledge into competition and learning into achievement.”*

