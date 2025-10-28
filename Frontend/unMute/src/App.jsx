import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
import AdminDashboard from './Pages/AdminDashboard.jsx'
import About from './Pages/about.jsx'
import Navbar from './Components/navbar.jsx'
import PageLoader from './Components/PageLoader.jsx'
import Footer from './Components/footer.jsx'
import './index.css';

function App() {
  // Component to track route changes and send page_view events to gtag
  function RouteChangeTracker() {
    const location = useLocation()
    useEffect(() => {
      // lazy import to avoid issues during SSR or if window.gtag isn't present yet
      import('./analytics/gtag').then(({ pageview }) => {
        pageview(location.pathname + location.search)
      }).catch(() => {})
    }, [location])
    return null
  }
  return (
    <Router>
      <RouteChangeTracker />
      <Navbar />
      <PageLoader>
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </PageLoader>
      <Footer />
    </Router>
  )
}

export default App