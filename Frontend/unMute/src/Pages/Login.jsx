
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoLockClosed, IoMail } from "react-icons/io5";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data?.error?.message || "Login failed");
      // Backend returns { status, token, user: { id, email, username, is_admin } }
      const flattened = {
        token: data.token,
        id: data.user?.id,
        email: data.user?.email,
        username: data.user?.username,
        is_admin: data.user?.is_admin === 1 || data.user?.is_admin === true, // normalize
      };
      login(flattened);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{
      backgroundColor: '#ffffff',
      backgroundImage: 'radial-gradient(#004643 0.5px, #ffffff 0.5px)',
      backgroundSize: '10px 10px'
    }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-[#004643] rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-[#004643] rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative z-10 border border-gray-100 overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Image Section - Left Side */}
        {/* Image Section - Left Side */}
        <div className="w-full h-48 lg:h-auto lg:w-1/2 bg-gradient-to-br from-[#004643] to-[#003832] relative">
              <div className="absolute inset-0">
            <img 
              src="/sign-in.png" 
              alt="Login illustration" 
                  className="w-full h-full object-cover object-left grayscale"
            />
          </div>
        </div>        {/* Form Section - Right Side */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 relative">
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-700 transition-colors z-10"
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <IoClose className="text-xl" />
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-block bg-[#004643] text-white p-4 rounded-2xl mb-4"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <IoLockClosed className="text-3xl" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Sign in to continue your journey
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email/Username Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IoMail className={`text-lg transition-colors ${focusedField === 'identifier' ? 'text-[#004643]' : 'text-gray-400'}`} />
              </div>
              <input
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-black bg-white transition-all duration-200 placeholder-gray-400 ${
                  focusedField === 'identifier' 
                    ? 'border-[#004643] shadow-lg shadow-[#004643]/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onFocus={() => setFocusedField('identifier')}
                onBlur={() => setFocusedField(null)}
                autoComplete="username"
                required
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IoLockClosed className={`text-lg transition-colors ${focusedField === 'password' ? 'text-[#004643]' : 'text-gray-400'}`} />
              </div>
              <input
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-black bg-white transition-all duration-200 placeholder-gray-400 ${
                  focusedField === 'password' 
                    ? 'border-[#004643] shadow-lg shadow-[#004643]/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
                required
              />
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#004643] text-white py-3.5 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:bg-[#003832] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </motion.button>
        </form>

        {/* Sign up link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 text-sm sm:text-base">
            Don't have an account?{" "}
            <button
              className="text-[#004643] hover:text-[#003832] font-semibold hover:underline transition-colors"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </p>
        </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
