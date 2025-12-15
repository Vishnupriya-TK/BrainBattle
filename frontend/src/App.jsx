import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Admin from "./components/Admin";
import AdminManage from "./components/AdminManage";
import Quiz from "./components/Quiz";
import Score from "./components/Score";
import AdminResults from "./components/AdminResults";
import ForgotPassword from "./components/ForgotPassword";
import UserResults from "./components/UserResults";
import UserDashboard from "./components/UserDashboard";
import Announcements from "./components/Announcements";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/quizzes" element={<AdminManage />} />
        <Route path="/admin/results" element={<AdminResults />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/score" element={<Score />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/results" element={<UserResults />} />
        <Route path="/user/announcements" element={<Announcements />} />
      </Routes>
    </Router>
  );
}

export default App;
