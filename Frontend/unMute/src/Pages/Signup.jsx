
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";


const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md relative">
        <button
          className="bg-gray-200 absolute top-2 right-2 rounded-full text-black text-xl font-bold "
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <IoClose />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-black">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-4 px-3 py-2 bg-white text-black border rounded autofill:bg-white autofill:text-black"
            type="text"
            placeholder="Username"
            autoComplete="off"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full mb-4 px-3 py-2 bg-white text-black border rounded autofill:bg-white autofill:text-black"
            type="email"
            placeholder="Email"
            autoComplete="off"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mb-6 px-3 py-2 bg-white text-black border rounded autofill:bg-white autofill:text-black"
            type="password"
            placeholder="Password"
            autoComplete="off"
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
        <p className="text-center text-gray-600">Already have an account?
          <button className="text-blue-600 hover:underline ml-1" onClick={() => navigate('/login')}>Log In</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
