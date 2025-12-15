import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQuizzes, getUser, clearAuth } from "../api";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role;
  const [showCreatedQuizzes, setShowCreatedQuizzes] = useState(false);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);

  useEffect(() => {
    if (role === "admin") {
      fetchCreatedQuizzes();
    }
  }, [role]);

  const fetchCreatedQuizzes = async () => {
    try {
      const quizzes = await getQuizzes();
      const userData = getUser('admin');
      const myQuizzes = quizzes.filter(q => {
        if (!q.createdBy) return false;
        const createdById = typeof q.createdBy === 'object' ? q.createdBy._id || q.createdBy.id : q.createdBy;
        return createdById === userData.id || createdById === userData._id;
      });
      setCreatedQuizzes(myQuizzes);
    } catch (error) {
      console.error("Error fetching created quizzes:", error);
    }
  };

  const handleLogout = () => {
    // Only clear the current role's auth data
    if (role === 'admin') {
      clearAuth('admin');
    } else if (role === 'user') {
      clearAuth('user');
    } else {
      clearAuth();
    }
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 h-full w-56 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-xl z-10">
      <div className="p-6 text-2xl font-bold text-center border-b border-white/20">Quiz App</div>
      <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
        {role === "admin" ? (
          <>
            <Link to="/admin" className="py-2 px-4 rounded hover:bg-white/10 transition">Create Quiz</Link>
            <Link to="/admin/quizzes" className="py-2 px-4 rounded hover:bg-white/10 transition">Manage Quizzes</Link>
            <Link to="/admin/results" className="py-2 px-4 rounded hover:bg-white/10 transition">Progress Tracker</Link>
            <div className="mt-2">
              <button
                onClick={() => setShowCreatedQuizzes(!showCreatedQuizzes)}
                className="w-full py-2 px-4 rounded hover:bg-white/10 transition text-left flex justify-between items-center"
              >
                <span>Created Quizzes</span>
                <span>{showCreatedQuizzes ? '▼' : '▶'}</span>
              </button>
              {showCreatedQuizzes && (
                <div className="ml-4 mt-2 space-y-1 max-h-60 overflow-y-auto">
                  {createdQuizzes.length > 0 ? (
                    createdQuizzes.map(q => (
                      <div key={q._id} className="py-1 px-2 text-sm bg-white/5 rounded">
                        <div className="font-semibold truncate">{q.title}</div>
                        <div className="text-xs text-white/70">Code: {q.quizCode}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/70 py-1 px-2">No quizzes created</div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/quiz" className="py-2 px-4 rounded hover:bg-white/10 transition">Take Quiz</Link>
            <Link to="/user/dashboard" className="py-2 px-4 rounded hover:bg-white/10 transition">Dashboard</Link>
            <Link to="/user/results" className="py-2 px-4 rounded hover:bg-white/10 transition">My Results</Link>
            <Link to="/user/announcements" className="py-2 px-4 rounded hover:bg-white/10 transition">Announcements</Link>
          </>
        )}
      </nav>
      <button
        onClick={handleLogout}
        className="m-4 py-2 px-4 bg-red-500 hover:bg-red-600 rounded text-white font-semibold transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar; 