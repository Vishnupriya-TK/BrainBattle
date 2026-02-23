import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { getLeaderboard, getQuizzes, getUser, getToken } from "../api";

const Announcements = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [rankHolders, setRankHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = getUser('user');
    const token = getToken('user');
    if (!userData || !token || userData.role !== "user") {
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchQuizzes();
  }, [navigate]);

  const fetchQuizzes = async () => {
    try {
      const quizzesData = await getQuizzes();
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes");
      setQuizzes([]);
    }
  };

  const fetchRankHolders = async (quizId) => {
    setLoading(true);
    setError("");
    try {
      const results = await getLeaderboard(quizId);
      // Get top 3
      const topResults = Array.isArray(results) ? results.slice(0, 3) : [];
      setRankHolders(topResults);
      if (topResults.length === 0) {
        setError("No participants yet for this quiz.");
      } else {
        setError("");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard. Please try again.");
      setRankHolders([]);
    }
    setLoading(false);
  };

  const handleQuizChange = (e) => {
    const quizId = e.target.value;
    setSelectedQuizId(quizId);
    if (quizId) {
      fetchRankHolders(quizId);
    } else {
      setRankHolders([]);
    }
  };

  const selectedQuiz = quizzes.find(q => q._id === selectedQuizId);

  const getTotalMarks = (quizLike) => {
    const questions = quizLike?.questions;
    if (!Array.isArray(questions) || questions.length === 0) return 0;
    return questions.reduce((sum, q) => {
      const marks =
        typeof q.marks === "number" && !Number.isNaN(q.marks) && q.marks > 0
          ? q.marks
          : 1;
      return sum + marks;
    }, 0);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 md:ml-56 ml-0 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-16 md:pt-4">
        <div className="max-w-6xl mx-auto">
          <UserHeader position="top" />
          <div className="bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-red-700">🏆 Rank Holders Announcements</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}
            
            {/* Quiz Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Quiz to View Rank Holders
              </label>
              <select
                value={selectedQuizId}
                onChange={handleQuizChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              >
                <option value="">Choose a quiz...</option>
                {quizzes.map(q => (
                  <option key={q._id} value={q._id}>{q.title}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading rank holders...</div>
            ) : selectedQuizId && rankHolders.length > 0 ? (
              <>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-center text-red-700 mb-2">
                    {selectedQuiz?.title}
                  </h3>
                  <p className="text-center text-gray-600">
                    Top 3 Performers
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rankHolders.map((result, index) => {
                    const userName = result.user?.name || result.user || 'Anonymous';
                    const userEmail = result.user?.email || '-';
                    const score = result.score || 0;
                    const quizForMarks = selectedQuiz || result.quiz;
                    const totalMarks = getTotalMarks(quizForMarks);
                    const submittedAt = result.submittedAt ? new Date(result.submittedAt) : new Date();
                    
                    return (
                      <div 
                        key={result._id || result.id || index} 
                        className={`p-6 rounded-xl shadow-2xl text-center transform transition-all hover:scale-105 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-600' :
                          'bg-gradient-to-br from-orange-300 to-orange-500 border-4 border-orange-600'
                        }`}
                      >
                        <div className="text-6xl mb-3">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">
                          {userName}
                        </div>
                        <div className="text-sm text-white/90 mb-3">
                          {userEmail}
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 mt-4">
                          <div className="text-3xl font-bold text-white">
                            {score} / {totalMarks || 'N/A'}
                          </div>
                          <div className="text-sm text-white/90 mt-1">
                            {totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(1) : 0}% Score
                          </div>
                        </div>
                        <div className="text-xs text-white/80 mt-2">
                          Completed: {submittedAt.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* All Participants Table */}
                {rankHolders.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-bold mb-4 text-gray-700">Top Participants</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto border-collapse">
                        <thead>
                          <tr className="bg-red-100">
                            <th className="px-4 py-2 text-left">Rank</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Score</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankHolders.map((result, index) => {
                            const userName = result.user?.name || result.user || 'Anonymous';
                            const userEmail = result.user?.email || '-';
                            const score = result.score || 0;
                            const quizForMarks = selectedQuiz || result.quiz;
                            const totalMarks = getTotalMarks(quizForMarks);
                            const submittedAt = result.submittedAt ? new Date(result.submittedAt) : new Date();
                            
                            return (
                              <tr key={result._id || result.id || index} className="border-b hover:bg-red-50">
                                <td className="px-4 py-2 font-bold">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} #{index + 1}
                                </td>
                                <td className="px-4 py-2">{userName}</td>
                                <td className="px-4 py-2">{userEmail}</td>
                                <td className="px-4 py-2 font-semibold">
                                  {score} / {totalMarks || 'N/A'}
                                </td>
                                <td className="px-4 py-2">
                                  {submittedAt.toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : selectedQuizId ? (
              <div className="text-center text-gray-500 py-8">
                No participants yet for this quiz.
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Please select a quiz to view rank holders.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;

