import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { getQuizzes, getQuiz, updateQuiz, deleteQuiz, getUser, getToken } from "../api";

const blankQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
  timeLimitSeconds: undefined,
});

const AdminManage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = getUser("admin");
    const token = getToken("admin");
    if (!userData || !token || userData.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(userData);
    loadQuizzes();
  }, [navigate]);

  const loadQuizzes = async () => {
    const list = await getQuizzes();
    setQuizzes(Array.isArray(list) ? list : []);
  };

  const loadQuiz = async (id) => {
    if (!id) {
      setQuiz(null);
      return;
    }
    setLoading(true);
    setError("");
    const data = await getQuiz(id);
    if (data && data._id) {
      setQuiz({
        ...data,
        questions: (data.questions || []).map((q) => ({
          question: q.question || "",
          options: q.options && q.options.length === 4 ? q.options : ["", "", "", ""],
          answer: q.answer || "",
          timeLimitSeconds:
            typeof q.timeLimitSeconds === "number" && !Number.isNaN(q.timeLimitSeconds)
              ? q.timeLimitSeconds
              : undefined,
        })),
      });
    } else {
      setError(data?.message || "Failed to load quiz");
    }
    setLoading(false);
  };

  const updateQuestionField = (idx, key, value) => {
    const next = [...quiz.questions];
    if (key === "optionsIndex") {
      next[idx].options[value.index] = value.value;
    } else if (key === "timeLimitSeconds") {
      next[idx].timeLimitSeconds = value;
    } else {
      next[idx][key] = value;
    }
    setQuiz({ ...quiz, questions: next });
  };

  const updateQuestionTime = (idx, rawValue, unit) => {
    if (!quiz) return;
    const trimmed = String(rawValue || "").trim();
    let seconds;
    if (!trimmed) {
      seconds = undefined;
    } else {
      const n = Number(trimmed);
      if (!Number.isNaN(n) && n > 0) {
        seconds = unit === "minutes" ? n * 60 : n;
      }
    }
    updateQuestionField(idx, "timeLimitSeconds", seconds);
  };

  const applyQuestionTimeToAll = (sourceIdx) => {
    if (!quiz) return;
    const sourceSeconds = quiz.questions[sourceIdx]?.timeLimitSeconds;
    const next = quiz.questions.map((q) => ({
      ...q,
      timeLimitSeconds: sourceSeconds,
    }));
    setQuiz({ ...quiz, questions: next });
  };

  const getTimeDisplay = (seconds) => {
    if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds <= 0) {
      return { unit: "seconds", value: "" };
    }
    if (seconds % 60 === 0) {
      return { unit: "minutes", value: String(seconds / 60) };
    }
    return { unit: "seconds", value: String(seconds) };
  };

  const addQuestion = () => {
    setQuiz({ ...quiz, questions: [...quiz.questions, blankQuestion()] });
  };

  const removeQuestion = (idx) => {
    const next = quiz.questions.filter((_, i) => i !== idx);
    setQuiz({ ...quiz, questions: next.length ? next : [blankQuestion()] });
  };

  const handleSave = async () => {
    if (!quiz) return;
    setLoading(true);
    setMessage("");
    setError("");
    const res = await updateQuiz(quiz._id, {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      timeLimitMinutes:
        typeof quiz.timeLimitMinutes === "number" && !isNaN(quiz.timeLimitMinutes)
          ? quiz.timeLimitMinutes
          : undefined,
    });
    if (res.error) {
      setError(res.error);
    } else {
      setMessage("Quiz updated");
      await loadQuizzes();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!quiz) return;
    setLoading(true);
    setMessage("");
    setError("");
    const res = await deleteQuiz(quiz._id);
    if (res.error) {
      setError(res.error);
    } else {
      setMessage("Quiz deleted");
      setQuiz(null);
      setSelectedId("");
      await loadQuizzes();
    }
    setLoading(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-56 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <UserHeader position="top" />

          <div className="bg-white p-6 rounded-xl shadow-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-pink-700">Manage Quizzes</h2>
                <p className="text-sm text-gray-500">Edit questions, update titles, or delete quizzes.</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    loadQuiz(e.target.value);
                  }}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((q) => (
                    <option key={q._id} value={q._id}>{q.title} ({q.quizCode})</option>
                  ))}
                </select>
                <button
                  onClick={loadQuizzes}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </div>

            {message && <div className="mb-3 text-green-600 text-sm">{message}</div>}
            {error && <div className="mb-3 text-red-500 text-sm">{error}</div>}

            {!selectedId && (
              <div className="text-gray-500 py-8 text-center">Select a quiz from above to edit.</div>
            )}

            {selectedId && quiz && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Title</label>
                    <input
                      value={quiz.title || ""}
                      onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                  <div>
                    <label className="text-sm text-gray-600">Time Limit (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={quiz.timeLimitMinutes ?? ""}
                      onChange={(e) =>
                        setQuiz({
                          ...quiz,
                          timeLimitMinutes: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      placeholder="No time limit"
                    />
                  </div>
                    <input
                      value={quiz.description || ""}
                      onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-pink-700">Questions</h3>
                  <button
                    onClick={addQuestion}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {quiz.questions.map((q, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-pink-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-700">Question {idx + 1}</div>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestionField(idx, "question", e.target.value)}
                        placeholder="Question"
                        className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            value={opt}
                            onChange={(e) => updateQuestionField(idx, "optionsIndex", { index: oIdx, value: e.target.value })}
                            placeholder={`Option ${oIdx + 1}`}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => updateQuestionField(idx, "answer", e.target.value)}
                        placeholder="Correct Answer"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                      {/* Per-question time limit */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">
                          Time Limit for this question
                        </span>
                        {(() => {
                          const { unit, value } = getTimeDisplay(q.timeLimitSeconds);
                          return (
                            <>
                              <input
                                type="number"
                                min="1"
                                value={value}
                                onChange={(e) => updateQuestionTime(idx, e.target.value, unit)}
                                className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                                placeholder="e.g. 30"
                              />
                              <select
                                value={unit}
                                onChange={(e) => updateQuestionTime(idx, value, e.target.value)}
                                className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                              >
                                <option value="seconds">seconds</option>
                                <option value="minutes">minutes</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => applyQuestionTimeToAll(idx)}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Apply to all questions
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Quiz"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManage;

