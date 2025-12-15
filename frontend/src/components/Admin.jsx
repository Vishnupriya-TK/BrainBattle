import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { createQuiz, getUser, getToken, getQuizzes, updateQuiz, deleteQuiz } from "../api";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [listError, setListError] = useState("");
  
  useEffect(() => {
    const userData = getUser('admin');
    const token = getToken('admin');
    if (!userData || !token || userData.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchCreatedQuizzes(userData);
  }, [navigate]);

  const fetchCreatedQuizzes = async (userDataOverride = null) => {
    try {
      const quizzes = await getQuizzes();
      const currentUser = userDataOverride || getUser('admin');
      const myQuizzes = (quizzes || []).filter(q => {
        const createdById = typeof q.createdBy === 'object' ? q.createdBy?._id : q.createdBy;
        return createdById === currentUser?.id || createdById === currentUser?._id;
      });
      setCreatedQuizzes(myQuizzes);
      setListError("");
    } catch (err) {
      console.error("Error loading created quizzes:", err);
      setListError("Failed to load created quizzes");
    }
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [success, setSuccess] = useState("");
  const [quizId, setQuizId] = useState("");
  const [error, setError] = useState("");

  const handleQuestionChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleAnswerChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].answer = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setQuizId("");
    const res = await createQuiz({ title, description, questions });
    if (res.quiz && res.quiz._id) {
      setSuccess("Quiz created successfully!");
      setQuizId(res.quiz.quizCode);
      setTitle("");
      setDescription("");
      setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
      fetchCreatedQuizzes();
    } else {
      setError(res.message || "Failed to create quiz");
    }
  };

  const startEdit = (quiz) => {
    setEditingQuiz(quiz);
    setEditTitle(quiz.title || "");
    setEditDescription(quiz.description || "");
  };

  const handleUpdate = async () => {
    if (!editingQuiz) return;
    const res = await updateQuiz(editingQuiz._id, {
      title: editTitle,
      description: editDescription,
      questions: editingQuiz.questions, // keep existing questions for now
    });
    if (res.error) {
      setListError(res.error);
    } else {
      setListError("");
      setEditingQuiz(null);
      await fetchCreatedQuizzes();
    }
  };

  const handleDelete = async (quizIdToDelete) => {
    if (!quizIdToDelete) return;
    const res = await deleteQuiz(quizIdToDelete);
    if (res.error) {
      setListError(res.error);
    } else {
      setListError("");
      await fetchCreatedQuizzes();
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-56 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <UserHeader position="top" />

          {/* Created Quizzes List with edit/delete */}
          <div className="bg-white p-6 rounded-xl shadow-2xl animate-fade-in mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h3 className="text-2xl font-bold text-pink-700">Your Quizzes</h3>
              {listError && <div className="text-sm text-red-500">{listError}</div>}
            </div>
            {createdQuizzes.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No quizzes created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-pink-100">
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Quiz Code</th>
                      <th className="px-4 py-2 text-left">Questions</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdQuizzes.map((quiz) => (
                      <tr key={quiz._id} className="border-b hover:bg-pink-50">
                        <td className="px-4 py-2">{quiz.title}</td>
                        <td className="px-4 py-2 font-mono text-sm">{quiz.quizCode}</td>
                        <td className="px-4 py-2">{quiz.questions?.length || 0}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => startEdit(quiz)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(quiz._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingQuiz && (
              <div className="mt-4 p-4 border rounded-lg bg-pink-50">
                <h4 className="text-lg font-semibold mb-2 text-pink-700">Edit Quiz</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-600">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingQuiz(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create Quiz Form */}
          <div className="bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">Create Quiz</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Quiz Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
            <textarea
              placeholder="Quiz Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-pink-50 p-4 rounded-lg shadow-inner">
                  <input
                    type="text"
                    placeholder={`Question ${idx + 1}`}
                    value={q.question}
                    onChange={e => handleQuestionChange(idx, e.target.value)}
                    className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {q.options.map((opt, oIdx) => (
                      <input
                        key={oIdx}
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                        required
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Correct Answer"
                    value={q.answer}
                    onChange={e => handleAnswerChange(idx, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    required
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-2 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 transition mb-2"
            >
              + Add Question
            </button>
            {success && (
              <div className="text-green-600 text-center font-semibold">
                {success} <br />
                <span className="text-sm">Quiz Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{quizId}</span></span>
              </div>
            )}
            {error && <div className="text-red-500 text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Create Quiz
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 