import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await signup({ name, email, password, role });
    if (res.message === "User created") {
      setSuccess("Signup successful! Redirecting to login...");
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setTimeout(() => {
        setSuccess("");
        navigate("/login");
      }, 1500);
    } else {
      setError(res.message || "Signup failed");
      setTimeout(() => { setError(""); }, 2500);
    }
  };

  // Clear messages on input
  const handleInput = (setter) => (e) => {
    setter(e.target.value);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={handleInput(setName)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleInput(setEmail)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleInput(setPassword)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            required
          />
          <div>
            <label className="block mb-1 font-medium">Role:</label>
            <select
              value={role}
              onChange={handleInput(setRole)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {success && <div className="text-green-600 text-center">{success}</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup; 