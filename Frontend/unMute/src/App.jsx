import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Signup from './Pages/Signup.jsx'
import Login from './Pages/Login.jsx'
import Explore from './Pages/Explore.jsx'
import Navbar from './Components/navbar.jsx'
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Router>
  )
}

export default App