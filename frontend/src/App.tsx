import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import ForumView from './pages/ForumView';
import ThreadView from './pages/ThreadView';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
import { Upgrades, HiddenService, Extras } from './pages/Extras';
import { forumApi } from './api';

function App() {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await forumApi.getConfig();
        const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
        if (res.data.maintenance === 'true' && (!currentUser || currentUser.role?.toUpperCase() !== 'ADMIN')) {
          setMaintenance(true);
        } else {
          setMaintenance(false);
        }
      } catch (e) {
        console.error("Config fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    
    checkConfig();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
       checkConfig();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab login updates if needed
    window.addEventListener('user-login', handleStorageChange);
    
    return () => {
       window.removeEventListener('storage', handleStorageChange);
       window.removeEventListener('user-login', handleStorageChange);
    };
  }, []);

  if (loading) return <div style={{ background: 'black', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>CONNECTING TO VOID...</div>;

  if (maintenance) {
      return (
          <Router>
              <Routes>
                  <Route path="/admin" element={<Admin />} /> 
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<Maintenance />} />
              </Routes>
          </Router>
      )
  }

  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={
            <>
              <Navbar />
              <main><Home /></main>
            </>
          } />
          <Route path="/admin" element={
            <>
              <Navbar />
              <main><Admin /></main>
            </>
          } />
          <Route path="/profile/:id" element={
            <>
              <Navbar />
              <main><Profile /></main>
            </>
          } />
          <Route path="/forum/:id" element={
            <>
              <Navbar />
              <main><ForumView /></main>
            </>
          } />
          <Route path="/thread/:id" element={
            <>
              <Navbar />
              <main><ThreadView /></main>
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <main><Login /></main>
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <main><Register /></main>
            </>
          } />
          <Route path="/messages" element={
            <>
              <Navbar />
              <main><Messages /></main>
            </>
          } />
          <Route path="/extras" element={
            <>
              <Navbar />
              <main><Extras /></main>
            </>
          } />
          <Route path="/upgrades" element={
            <>
              <Navbar />
              <main><Upgrades /></main>
            </>
          } />
          <Route path="/hidden" element={
            <>
              <Navbar />
              <main><HiddenService /></main>
            </>
          } />

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
