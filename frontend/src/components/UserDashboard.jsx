import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { getResults, getQuizzes, getUser, getToken } from "../api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
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
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Backend automatically filters by logged-in user for non-admin users
      const [resultsData, quizzesData] = await Promise.all([
        getResults(),
        getQuizzes()
      ]);
      
      console.log('Dashboard - Fetched data:', {
        resultsIsArray: Array.isArray(resultsData),
        resultsCount: Array.isArray(resultsData) ? resultsData.length : 0,
        resultsData: resultsData,
        quizzesCount: Array.isArray(quizzesData) ? quizzesData.length : 0
      });
      
      if (Array.isArray(resultsData)) {
        setResults(resultsData);
        if (resultsData.length > 0) {
          console.log('Dashboard - Sample result:', {
            id: resultsData[0]._id,
            quizTitle: resultsData[0].quiz?.title,
            score: resultsData[0].score,
            user: resultsData[0].user
          });
        }
      } else {
        console.warn('Dashboard - Results is not an array:', resultsData);
        setResults([]);
      }
      
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      
      if (Array.isArray(resultsData) && resultsData.length === 0) {
        // No error, just no results yet
        setError("");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      setResults([]);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalQuizzes = quizzes.length;
  const quizzesTaken = results.length;
  const quizzesNotTaken = Math.max(0, totalQuizzes - quizzesTaken);
  
  // Calculate average score percentage
  let averageScore = 0;
  if (results.length > 0) {
    const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
    const totalMarks = results.reduce((sum, r) => {
      const questions = r.quiz?.questions;
      if (!Array.isArray(questions) || questions.length === 0) return sum;
      const quizMarks = questions.reduce((innerSum, q) => {
        const marks =
          typeof q.marks === "number" && !Number.isNaN(q.marks) && q.marks > 0
            ? q.marks
            : 1;
        return innerSum + marks;
      }, 0);
      return sum + quizMarks;
    }, 0);
    if (totalMarks > 0) {
      averageScore = ((totalScore / totalMarks) * 100).toFixed(1);
    }
  }
  
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);

  // Get recent results
  const recentResults = [...results]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 md:ml-56 ml-0 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-16 md:pt-4">
        <div className="max-w-6xl mx-auto">
          <UserHeader position="top" />
          <div className="bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Progress Dashboard</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-700">{quizzesTaken}</div>
                    <div className="text-sm text-gray-600">Quizzes Taken</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-700">{quizzesNotTaken}</div>
                    <div className="text-sm text-gray-600">Available Quizzes</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-700">{averageScore}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-700">{totalScore}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Overall Progress</h3>
                  <div className="bg-gray-200 rounded-full h-4 mb-2">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{ 
                        width: `${totalQuizzes > 0 ? (quizzesTaken / totalQuizzes * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {quizzesTaken} of {totalQuizzes} quizzes completed
                  </p>
                </div>

                {/* Recent Results */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Recent Quiz Results</h3>
                  {recentResults.length > 0 ? (
                    <div className="space-y-3">
                      {recentResults.map(result => {
                        const quizTitle = result.quiz?.title || result.quiz || 'Quiz';
                        const questions = result.quiz?.questions;
                        const totalMarks = Array.isArray(questions) && questions.length > 0
                          ? questions.reduce((sum, q) => {
                              const marks =
                                typeof q.marks === "number" && !Number.isNaN(q.marks) && q.marks > 0
                                  ? q.marks
                                  : 1;
                              return sum + marks;
                            }, 0)
                          : 0;
                        const score = result.score || 0;
                        const submittedAt = result.submittedAt ? new Date(result.submittedAt) : new Date();
                        
                        return (
                          <div key={result._id || result.id || Math.random()} className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-gray-800">{quizTitle}</h4>
                                <p className="text-sm text-gray-600">
                                  {submittedAt.toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                  {score} / {totalMarks || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No quiz results yet. Take a quiz to see your progress!
                    </div>
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

export default UserDashboard;

