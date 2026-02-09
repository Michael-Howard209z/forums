import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Home, Database, Zap, Search, Shield, Plus, LogIn, UserPlus, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Close modals when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname]);
  
  const getUser = () => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching archives for: ${searchQuery}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Utility Bar */}
      <div className="top-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
              <Home size={16} />
            </Link>
            <nav className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
              <NavButton to="/home" icon={<Database size={14} />} label="DATABASES" active={isActive('/home')} />
              <NavButton to="/upgrades" icon={<Zap size={14} />} label="UPGRADES" active={isActive('/upgrades')} />
              <button 
                onClick={() => setShowSearch(true)}
                className="nav-btn-alt"
              >
                <Search size={14} /> SEARCH
              </button>
              <NavButton to="/hidden" icon={<Shield size={14} />} label="HIDDEN SERVICE" active={isActive('/hidden')} />
              <NavButton to="/extras" icon={<Plus size={14} />} label="EXTRAS" active={isActive('/extras')} />
              
              {user?.role === 'ADMIN' && (
                <NavButton 
                  to="/admin" 
                  icon={<Shield size={14} />} 
                  label="ADMIN CP" 
                  active={isActive('/admin')} 
                  color="var(--accent)"
                />
              )}
            </nav>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link 
                  to={`/profile/${user.id}`} 
                  style={{ 
                    color: 'var(--primary)', 
                    fontSize: '0.8rem', 
                    fontWeight: 800,
                    textDecoration: isActive(`/profile/${user.id}`) ? 'underline' : 'none'
                  }}
                >
                  {user.name.toUpperCase()}
                </Link>
                <Link 
                  to="/messages" 
                  title="Private Messages"
                  style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <MessageCircle size={16} />
                </Link>
                <button onClick={handleLogout} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/login" className="nav-btn-auth">
                  <LogIn size={14} /> LOGIN
                </Link>
                <Link to="/register" className="nav-btn-auth register">
                  <UserPlus size={14} /> REGISTER
                </Link>
              </div>
            )}
            <button className="burger-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="sub-nav">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Home size={14} />
            <Link to="/home" style={{ color: 'var(--text-main)' }}>GojoVoid</Link>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {location.pathname === '/home' ? 'Archives' : 
               location.pathname.startsWith('/forum') ? 'Forum View' :
               location.pathname.startsWith('/thread') ? 'Discussion' :
               location.pathname.startsWith('/profile') ? 'Sorcerer Profile' :
               location.pathname.startsWith('/admin') ? 'Forbidden Management' : 'Navigation'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '1.5rem', border: '1px solid var(--primary)' }}
            >
              <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    autoFocus
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the forbidden archives..."
                    style={{ background: '#0a0a0a', border: '1px solid var(--glass-border)', padding: '0.8rem', flex: 1, color: 'white', borderRadius: '4px' }}
                  />
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'black', padding: '0 1.5rem', fontWeight: 'bold', borderRadius: '4px' }}>
                    FIND
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-menu"
            >
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', color: 'white' }}
              >
                <X size={32} />
              </button>
              
              <Link to="/home" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
              <button 
                onClick={() => { setShowSearch(true); setMobileMenuOpen(false); }}
                style={{ background: 'none', color: 'white', textAlign: 'left', fontSize: '1.2rem', fontWeight: 800, padding: '1rem 0' }}
              >
                SEARCH
              </button>
              {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}>ADMIN CP</Link>}
              
              {user && <Link to="/messages" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)' }}>MESSAGES</Link>}
              
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />
              
              {user ? (
                <>
                  <Link to={`/profile/${user.id}`} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)' }}>{user.name.toUpperCase()}</Link>
                  <button onClick={handleLogout} style={{ background: 'none', color: 'var(--accent)', textAlign: 'left', fontSize: '1.1rem', fontWeight: 700, padding: '0.5rem 0' }}>LOGOUT</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>REGISTER</Link>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavButton = ({ to, icon, label, active, color }: { to: string, icon: any, label: string, active?: boolean, color?: string }) => (
  <Link 
    to={to} 
    className={`nav-btn-main ${active ? 'active' : ''}`}
    style={{ color: color || 'inherit' }}
  >
    {icon} {label}
  </Link>
);

export default Navbar;
