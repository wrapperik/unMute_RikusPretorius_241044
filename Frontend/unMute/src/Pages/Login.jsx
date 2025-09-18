
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { AuthContext } from "../context/AuthContext";


const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data); // Save user in context
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl  shadow-md w-full max-w-md relative">
        <button
          className="bg-gray-200 absolute top-2 right-2 rounded-full text-black text-xl font-bold"
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <IoClose />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Log In</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-4 px-3 py-2 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mb-6 px-3 py-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button
            className="w-full bg-black text-white py-2 rounded hover:bg-orange-700 mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-center text-gray-600">Don't have an account?
          <button className="text-blue-600 hover:underline ml-1" onClick={() => navigate('/signup')}>Sign Up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
