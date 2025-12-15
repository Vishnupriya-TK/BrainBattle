import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { getQuiz, getQuizzes, submitQuiz, getUser, getToken } from "../api";

const Quiz = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = getUser('user');
    const token = getToken('user');
    if (!user || !token || user.role !== "user") {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const [quizCode, setQuizCode] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState([]);

  const handleFetchQuiz = async (e) => {
    e.preventDefault();
    if (!quizCode.trim()) {
      setError("Please enter a quiz code");
      return;
    }
    setError("");
    try {
      const res = await getQuiz(quizCode);
      if (res && res._id) {
        setQuiz(res);
        setCurrent(0);
        setSelected(null);
        setScore(null);
        setShowScore(false);
        setAnswers([]);
      } else {
        setError("Quiz not found. Please check the code and try again.");
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Failed to fetch quiz. Please try again later.");
    }
  };

  // Removed handleSelectQuiz as we're not showing a list of quizzes anymore

  const handleOptionClick = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    const currentQ = quiz.questions[current];
    setAnswers([
      ...answers,
      {
        question: currentQ.question,
        selected,
        correct: currentQ.answer,
      },
    ]);
    if (current < quiz.questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setError("");
      const currentQ = quiz.questions[current];
      const finalAnswers = [
        ...answers,
        {
          question: currentQ.question,
          selected: selected || "",
          correct: currentQ.answer,
        },
      ];
      
      console.log('Submitting quiz:', {
        quizId: quiz._id,
        answersCount: finalAnswers.length,
        totalQuestions: quiz.questions.length
      });
      
      const res = await submitQuiz(quiz._id, finalAnswers);
      
      if (res.error) {
        setError(res.error || "Failed to submit quiz");
        console.error("Submit error:", res.error);
      } else if (res.score !== undefined) {
        setScore(res.score);
        setShowScore(true);
        console.log("Quiz submitted successfully. Score:", res.score, "out of", quiz.questions.length);
        
        // Clear quiz state after a delay to allow viewing the score
        setTimeout(() => {
          // Optionally refresh results if on results page
        }, 100);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    }
  };

  if (!quiz) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-56 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="w-full max-w-md mb-4">
            <UserHeader position="top" />
          </div>
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Enter Quiz Code</h2>
            <form onSubmit={handleFetchQuiz} className="w-full">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter the 6-digit quiz code"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  maxLength={6}
                  pattern="\d{6}"
                  title="Please enter a 6-digit code"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                disabled={!quizCode.trim()}
              >
                Start Quiz
              </button>
              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-56 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="w-full max-w-md mb-4">
            <UserHeader position="top" />
          </div>
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in text-center">
            <h2 className="text-3xl font-bold mb-6 text-purple-700">Quiz Complete!</h2>
            <p className="text-xl mb-2">Quiz: <span className="font-bold text-purple-600">{quiz.title}</span></p>
            <p className="text-xl mb-6">Your Score: <span className="font-bold text-purple-600">{score} / {quiz.questions.length}</span></p>
            <button
              onClick={() => navigate("/user/results")}
              className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition mb-2"
            >
              View All Results
            </button>
            <button
              onClick={() => {
                setQuiz(null);
                setQuizCode("");
                setShowScore(false);
                setScore(null);
                setCurrent(0);
                setSelected(null);
                setAnswers([]);
              }}
              className="w-full py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-56 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md mb-4">
          <UserHeader position="top" />
        </div>
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
          <div className="mb-4 text-gray-500">Question {current + 1} of {quiz.questions.length}</div>
          <h2 className="text-2xl font-bold mb-6 text-purple-700">{quiz.questions[current].question}</h2>
          <div className="space-y-3 mb-6">
            {quiz.questions[current].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={`w-full py-2 rounded-lg border font-semibold transition text-left px-4 ${selected === option ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-purple-100'}`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={selected === null}
            className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {current === quiz.questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 