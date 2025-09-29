import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Signup from './Pages/Signup.jsx'
import Login from './Pages/Login.jsx'
import Explore from './Pages/Explore.jsx'
import AddPostPage from './Pages/addPost.jsx'
import AddEntryPage from './Pages/addEntry.jsx'
import ViewPostPage from './Pages/viewPost.jsx';
import ViewEntryPage from './Pages/viewEntry.jsx';
import ResourcesPage from './Pages/Resources.jsx'
import JournalPage from './Pages/journal.jsx'
import AddResourcePage from './Pages/addResource.jsx'
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
    <Route path="/resources" element={<ResourcesPage />} />
    <Route path="/addresource" element={<AddResourcePage />} />
    <Route path="/addpost" element={<AddPostPage />} />
  <Route path="/addentry" element={<AddEntryPage />} />
    <Route path="/viewpost/:id" element={<ViewPostPage />} />
  <Route path="/viewentry/:id" element={<ViewEntryPage />} />
     <Route path="/journal" element={<JournalPage />} />
      </Routes>
    </Router>
  )
}

export default App