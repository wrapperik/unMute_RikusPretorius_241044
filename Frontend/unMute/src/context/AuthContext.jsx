import { createContext, useState, useEffect } from "react";

// Create a context for authentication state that can be accessed throughout the app
// This allows any component to access user data and auth functions without prop drilling
export const AuthContext = createContext();

// AuthProvider component wraps the app and provides authentication state to all children
export const AuthProvider = ({ children }) => {
  // State to store the current authenticated user's data (or null if not logged in)
  // User object contains: { id, email, username, is_admin, token, profilePicture }
  const [user, setUser] = useState(null);

  // On app startup, check if user data exists in localStorage (for persistent login)
  // This runs once when the component mounts (empty dependency array [])
  useEffect(() => {
    const saved = localStorage.getItem("user");
    // If user data exists in localStorage, parse it and restore the user session
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Login function: saves user data to both state and localStorage
  // Called after successful login/register API calls
  const login = (userData) => {
    setUser(userData); // Update React state (triggers re-render)
    localStorage.setItem("user", JSON.stringify(userData)); // Persist to localStorage
  };

  // Logout function: clears user data from both state and localStorage
  // Called when user explicitly logs out or token expires
  const logout = () => {
    setUser(null); // Clear React state
    localStorage.removeItem("user"); // Remove from localStorage
  };

  // Provide the user state and auth functions to all child components
  // Any component wrapped by AuthProvider can use useContext(AuthContext) to access these values
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};