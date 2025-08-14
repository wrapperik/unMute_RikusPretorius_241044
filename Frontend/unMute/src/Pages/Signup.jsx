import React from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

const Signup = () => {
  const navigate = useNavigate();
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
        <form>
          <input className="w-full mb-4 px-3 py-2 bg-white text-black border rounded autofill:bg-white autofill:text-black" type="text" placeholder="Username" autoComplete="off" />
          <input className="w-full mb-4 px-3 py-2 bg-white text-black border rounded autofill:bg-white autofill:text-black" type="email" placeholder="Email" autoComplete="off" />
          <input className="w-full mb-6 px-3 py-2 bg-white text-black border rounded autofill:bg-white autofill:text-black" type="password" placeholder="Password" autoComplete="off" />
          <button className="w-full bg-black text-white py-2 rounded hover:bg-orange-700 mb-4">Sign Up</button>
        </form>
        <p className="text-center text-gray-600">Already have an account?
          <button className="text-blue-600 hover:underline ml-1" onClick={() => navigate('/login')}>Log In</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
