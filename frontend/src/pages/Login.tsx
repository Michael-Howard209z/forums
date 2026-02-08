import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { authApi } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Trigger update for App.tsx
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("user-login"));
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '3rem',
          borderRadius: '1rem',
          border: '1px solid var(--secondary)'
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '2px' }}>VOID LOGIN</h2>
        <p style={{ color: 'var(--secondary)', marginBottom: '2.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Welcome to the Infinity</p>
        
        {error && <p style={{ color: 'var(--accent)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input 
              type="email" 
              placeholder="User Email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem', border: '1px solid rgba(14, 165, 233, 0.2)' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input 
              type="password" 
              placeholder="Void Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem', border: '1px solid rgba(14, 165, 233, 0.2)' }}
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'var(--secondary)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              padding: '1rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '0',
              fontWeight: 'bold',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              letterSpacing: '2px'
            }}
          >
            {loading ? 'EXPANDING...' : 'ACCESS'} <ArrowRight size={18} />
          </motion.button>
        </form>
        
        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          New Sorcerer? <Link to="/register" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
