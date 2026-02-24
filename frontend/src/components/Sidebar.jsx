import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQuizzes, getUser, clearAuth } from "../api";

const Sidebar = ({ disableNavigation = false }) => {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role;

  const [showCreatedQuizzes, setShowCreatedQuizzes] = useState(false);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (role === "admin") {
      fetchCreatedQuizzes();
    }
  }, [role]);

  const fetchCreatedQuizzes = async () => {
    try {
      const quizzes = await getQuizzes();
      const userData = getUser();

      const myQuizzes = quizzes.filter((q) => {
        if (!q.createdBy) return false;
        const createdById =
          typeof q.createdBy === "object"
            ? q.createdBy._id || q.createdBy.id
            : q.createdBy;

        return (
          createdById === userData.id ||
          createdById === userData._id
        );
      });

      setCreatedQuizzes(myQuizzes);
    } catch (error) {
      console.error("Error fetching created quizzes:", error);
    }
  };

  const handleLogout = () => {
    if (disableNavigation) return;

    if (role === "admin") {
      clearAuth("admin");
    } else if (role === "user") {
      clearAuth("user");
    } else {
      clearAuth();
    }

    navigate("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-30 md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-2xl"
        >
          ☰
        </button>
        <div className="text-lg font-bold">Quiz App</div>
      </div>

      {/* Overlay when sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-56 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-xl z-40 transform transition-transform duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-white/20 md:hidden">
          <div className="text-lg font-bold">Menu</div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Desktop Title */}
        <div className="hidden md:block p-6 text-2xl font-bold text-center border-b border-white/20">
          Quiz App
        </div>

        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto mt-2 md:mt-0">
          {role === "admin" ? (
            <>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                Create Quiz
              </Link>

              <Link
                to="/admin/quizzes"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                Manage Quizzes
              </Link>

              <Link
                to="/admin/results"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                Progress Tracker
              </Link>

              <div className="mt-2">
                <button
                  onClick={() =>
                    setShowCreatedQuizzes(!showCreatedQuizzes)
                  }
                  className="w-full py-2 px-4 rounded hover:bg-white/10 transition text-left flex justify-between items-center"
                >
                  <span>Created Quizzes</span>
                  <span>
                    {showCreatedQuizzes ? "▼" : "▶"}
                  </span>
                </button>

                {showCreatedQuizzes && (
                  <div className="ml-4 mt-2 space-y-1 max-h-60 overflow-y-auto">
                    {createdQuizzes.length > 0 ? (
                      createdQuizzes.map((q) => (
                        <div
                          key={q._id}
                          className="py-1 px-2 text-sm bg-white/5 rounded"
                        >
                          <div className="font-semibold truncate">
                            {q.title}
                          </div>
                          <div className="text-xs text-white/70">
                            Code: {q.quizCode}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-white/70 py-1 px-2">
                        No quizzes created
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/quiz"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                Take Quiz
              </Link>

              <Link
                to="/user/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                Dashboard
              </Link>

              <Link
                to="/user/results"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                My Results
              </Link>

              <Link
                to="/user/announcements"
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-4 rounded hover:bg-white/10 transition"
              >
                Announcements
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={handleLogout}
          disabled={disableNavigation}
          className={`m-4 py-2 px-4 rounded text-white font-semibold transition ${
            disableNavigation
              ? "bg-red-400 cursor-not-allowed opacity-60"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;