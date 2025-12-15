import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { getResults, getQuizzes, getUser, getToken } from "../api";

const AdminResults = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userData = getUser('admin');
    const token = getToken('admin');
    if (!userData || !token || userData.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(userData);
  }, [navigate]);

  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const quizzesData = await getQuizzes();
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        // Fetch all results initially
        await fetchResults({});
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
      }
    };
    if (user) {
      loadData();
    }
  }, [user]);

  const fetchResults = async (filter = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await getResults(filter);
      console.log('AdminResults - Fetched data:', {
        filter,
        isArray: Array.isArray(res),
        length: Array.isArray(res) ? res.length : 0,
        data: res
      });
      
      if (Array.isArray(res)) {
        setResults(res);
        setError("");
        if (res.length > 0) {
          console.log('AdminResults - Sample result:', {
            id: res[0]._id,
            quizTitle: res[0].quiz?.title,
            userName: res[0].user?.name,
            score: res[0].score
          });
        }
      } else if (res && res.error) {
        // Only show error if it's not a network issue
        if (res.error !== 'Network error') {
          setError(res.error);
        }
        setResults([]);
      } else {
        console.warn('AdminResults - Unexpected response format:', res);
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to fetch results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchResults({ quizId });
  };

  // Get top 3 results for selected quiz
  const getTopThree = () => {
    if (!quizId) return [];
    const quizResults = results
      .filter(r => {
        const rQuizId = r.quiz?._id || r.quiz;
        return rQuizId === quizId || String(rQuizId) === String(quizId);
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return quizResults;
  };

  // Get all attendees for selected quiz
  const getAttendees = () => {
    if (!quizId) return results;
    return results.filter(r => {
      const rQuizId = r.quiz?._id || r.quiz;
      return rQuizId === quizId || String(rQuizId) === String(quizId);
    });
  };

  const topThree = getTopThree();
  const attendees = getAttendees();
  const selectedQuiz = quizzes.find(q => q._id === quizId);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-56 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <UserHeader position="top" />
          
          <div className="bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">Progress Tracker</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}
            
            {/* Quiz Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={quizId}
                onChange={e => {
                  const selectedQuizId = e.target.value;
                  setQuizId(selectedQuizId);
                  if (selectedQuizId) {
                    fetchResults({ quizId: selectedQuizId });
                  } else {
                    fetchResults({});
                  }
                }}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition flex-1"
              >
                <option value="">All Quizzes</option>
                {quizzes.map(q => (
                  <option key={q._id} value={q._id}>{q.title}</option>
                ))}
              </select>
              <button 
                onClick={() => fetchResults(quizId ? { quizId } : {})}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <>
                {/* Top 3 Rank Holders */}
                {quizId && topThree.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-4 text-pink-700 text-center">🏆 Top 3 Rank Holders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topThree.map((result, index) => {
                        const userName = result.user?.name || result.user || 'Unknown';
                        const userEmail = result.user?.email || '-';
                        const score = result.score || 0;
                        const totalQuestions = selectedQuiz?.questions?.length || result.quiz?.questions?.length || 0;
                        const submittedAt = result.submittedAt ? new Date(result.submittedAt) : new Date();
                        
                        return (
                          <div 
                            key={result._id || result.id || index} 
                            className={`p-4 rounded-lg shadow-lg text-center ${
                              index === 0 ? 'bg-yellow-200 border-4 border-yellow-400' :
                              index === 1 ? 'bg-gray-200 border-4 border-gray-400' :
                              'bg-orange-200 border-4 border-orange-400'
                            }`}
                          >
                            <div className="text-4xl mb-2">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                            <div className="text-xl font-bold">{userName}</div>
                            <div className="text-sm text-gray-600">{userEmail}</div>
                            <div className="text-2xl font-bold mt-2 text-pink-700">
                              Score: {score} / {totalQuestions || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {submittedAt.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Attendees and Results */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-pink-700">
                    {quizId ? `All Attendees for "${selectedQuiz?.title}"` : 'All Results'} ({quizId ? attendees.length : results.length})
                  </h3>
                  {quizId ? (
                    attendees.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                          <thead>
                            <tr className="bg-pink-100">
                              <th className="px-4 py-2 text-left">Rank</th>
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Email</th>
                              <th className="px-4 py-2 text-left">Score</th>
                              <th className="px-4 py-2 text-left">Total Questions</th>
                              <th className="px-4 py-2 text-left">Submitted At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendees
                              .sort((a, b) => (b.score || 0) - (a.score || 0))
                              .map((r, index) => {
                                const userName = r.user?.name || r.user || 'Unknown';
                                const userEmail = r.user?.email || "-";
                                const score = r.score || 0;
                                const totalQuestions = selectedQuiz?.questions?.length || r.quiz?.questions?.length || 0;
                                const submittedAt = r.submittedAt ? new Date(r.submittedAt) : new Date();
                                
                                return (
                                  <tr key={r._id || r.id || index} className="border-b hover:bg-pink-50">
                                    <td className="px-4 py-2 font-bold">#{index + 1}</td>
                                    <td className="px-4 py-2">{userName}</td>
                                    <td className="px-4 py-2">{userEmail}</td>
                                    <td className="px-4 py-2 font-semibold">{score}</td>
                                    <td className="px-4 py-2">{totalQuestions || 'N/A'}</td>
                                    <td className="px-4 py-2">{submittedAt.toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No attendees yet for this quiz.
                      </div>
                    )
                  ) : (
                    results.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                          <thead>
                            <tr className="bg-pink-100">
                              <th className="px-4 py-2 text-left">Quiz</th>
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Email</th>
                              <th className="px-4 py-2 text-left">Score</th>
                              <th className="px-4 py-2 text-left">Total Questions</th>
                              <th className="px-4 py-2 text-left">Submitted At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results
                              .sort((a, b) => {
                                const dateA = a.submittedAt ? new Date(a.submittedAt) : new Date(0);
                                const dateB = b.submittedAt ? new Date(b.submittedAt) : new Date(0);
                                return dateB - dateA;
                              })
                              .map((r) => {
                                const quizTitle = r.quiz?.title || r.quiz || 'Unknown Quiz';
                                const userName = r.user?.name || r.user || 'Unknown';
                                const userEmail = r.user?.email || "-";
                                const score = r.score || 0;
                                const totalQuestions = r.quiz?.questions?.length || r.quiz?.questions || 0;
                                const submittedAt = r.submittedAt ? new Date(r.submittedAt) : new Date();
                                
                                return (
                                  <tr key={r._id || r.id || Math.random()} className="border-b hover:bg-pink-50">
                                    <td className="px-4 py-2">{quizTitle}</td>
                                    <td className="px-4 py-2">{userName}</td>
                                    <td className="px-4 py-2">{userEmail}</td>
                                    <td className="px-4 py-2 font-semibold">{score}</td>
                                    <td className="px-4 py-2">{totalQuestions || 'N/A'}</td>
                                    <td className="px-4 py-2">{submittedAt.toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No results found. Create quizzes and have users take them to see results here.
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResults; 