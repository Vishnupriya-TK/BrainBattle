import React from "react";
import { Link } from "react-router-dom";

const Score = () => {
  // Example score (replace with real data later)
  const score = 2;
  const total = 2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in text-center">
        <h2 className="text-3xl font-bold mb-6 text-blue-700">Your Score</h2>
        <p className="text-2xl mb-4">{score} / {total}</p>
        <p className="mb-6 text-green-600 font-semibold">{score === total ? 'Excellent! 🎉' : 'Good try! 👍'}</p>
        <Link to="/quiz" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mr-2">Retake Quiz</Link>
        <Link to="/" className="inline-block px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition">Home</Link>
      </div>
    </div>
  );
};

export default Score; 