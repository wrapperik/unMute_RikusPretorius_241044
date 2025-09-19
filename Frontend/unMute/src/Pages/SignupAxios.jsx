import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const BACKEND_URL = "http://localhost:5050/auth/register";

export default function SignupAxios() {
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await axios.post(BACKEND_URL, {
        email,
        username,
        password,
      }, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data && res.data.message) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || err.message || "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout function for AuthContext
  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-black">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-4 px-3 py-2 bg-white text-black border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mb-4 px-3 py-2 bg-white text-black border rounded"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full mb-6 px-3 py-2 bg-white text-black border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">Signup successful! Redirecting...</div>}
          <button
            className="w-full bg-black text-white py-2 rounded hover:bg-orange-700 mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <button
          className="w-full bg-gray-200 text-black py-2 rounded hover:bg-gray-300 mt-2"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
