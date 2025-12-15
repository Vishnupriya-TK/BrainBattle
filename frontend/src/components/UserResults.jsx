import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { getResults, getUser, getToken } from "../api";

const UserResults = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
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
    fetchUserResults();
  }, [navigate]);

  const fetchUserResults = async () => {
    setLoading(true);
    setError("");
    try {
      // Backend automatically filters by logged-in user for non-admin users
      const res = await getResults();
      console.log('UserResults - Fetched data:', {
        isArray: Array.isArray(res),
        length: Array.isArray(res) ? res.length : 0,
        data: res
      });
      
      if (Array.isArray(res)) {
        setResults(res);
        if (res.length === 0) {
          setError(""); // No error, just no results
        } else {
          console.log('UserResults - Setting results:', res.map(r => ({
            id: r._id,
            quizTitle: r.quiz?.title,
            score: r.score
          })));
        }
      } else {
        console.warn('UserResults - Response is not an array:', res);
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load results");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-56 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <UserHeader position="top" />
          <div className="bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">My Results</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map(result => {
                  const quizTitle = result.quiz?.title || result.quiz || 'Quiz';
                  const totalQuestions = result.quiz?.questions?.length || result.quiz?.questions || 0;
                  const score = result.score || 0;
                  const submittedAt = result.submittedAt ? new Date(result.submittedAt) : new Date();
                  
                  return (
                    <div key={result._id || result.id || Math.random()} className="bg-purple-50 p-6 rounded-lg shadow-lg border border-purple-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-purple-700">{quizTitle}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Submitted: {submittedAt.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-purple-600">
                            {score}
                          </div>
                          <div className="text-sm text-gray-500">
                            / {totalQuestions || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full transition-all"
                            style={{ 
                              width: `${totalQuestions > 0 ? ((score / totalQuestions) * 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0}% Correct
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No results found. Take a quiz to see your results here!
                <div className="mt-2 text-xs text-gray-400">
                  Debug: Results array length = {results.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserResults;

