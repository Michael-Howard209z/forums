import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Expanding Domain...');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      // User is already logged in, redirect to home
      navigate('/home', { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setLoading(false);
          }, 500);
          return 100;
        }
        
        if (oldProgress > 30 && oldProgress < 60) setStatusText('Detecting Cursed Energy...');
        if (oldProgress >= 60 && oldProgress < 90) setStatusText('Synthesizing Hollow Purple...');
        if (oldProgress >= 90) setStatusText('Infinite Void Accessed.');
        
        const diff = Math.random() * 20;
        return Math.min(oldProgress + diff, 100);
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    navigate('/home');
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      color: '#fff',
      overflow: 'hidden',
      fontFamily: '"Outfit", sans-serif'
    }}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1 }}
            style={{ textAlign: 'center', zIndex: 10 }}
          >
            <motion.div>
              <img src="http://192.168.1.8:5000/images/gojo_hero.jpg" 
              style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '2rem' }}
              alt="icon" />
            </motion.div> 
            
            <h2 style={{ fontSize: '1.2rem', fontWeight: 300, marginBottom: '1.5rem', letterSpacing: '4px', color: '#9333ea' }}>
              DDoS Protect
            </h2>
            
            <div style={{
              width: '300px',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '1px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
                <motion.div 
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #9333ea, #0ea5e9)',
                    width: `${progress}%`,
                    boxShadow: '0 0 20px #9333ea'
                  }}
                />
            </div>
            
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '1px' }}>{statusText}</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '1rem',
              zIndex: 10
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              style={{
                width: '180px',
                height: '180px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Eye-like circle */}
              <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '1px solid #0ea5e9',
                  borderRadius: '50%',
                  opacity: 0.3
              }} />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '80%',
                  height: '80%',
                  border: '4px dashed #9333ea',
                  borderRadius: '50%',
                  opacity: 0.5
                }} 
              />
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                boxShadow: '0 0 30px #0ea5e9, 0 0 60px #fff'
              }} />
            </motion.div>

            <h1 style={{
              fontSize: '6rem',
              fontWeight: '900',
              background: 'linear-gradient(to bottom, #fff 0%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(14, 165, 233, 0.5)',
              margin: '0',
              letterSpacing: '-4px'
            }}>
              Gojo
            </h1>
            <p style={{ color: '#9333ea', letterSpacing: '8px', fontSize: '0.8rem', marginTop: '-1rem', marginBottom: '2rem' }}>
              THE STRONGEST FORUM
            </p>

            <motion.button
              whileHover={{ scale: 1.05, letterSpacing: '4px' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1rem 4rem',
                background: 'transparent',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '0',
                color: '#fff',
                fontSize: '1rem',
                letterSpacing: '2px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              ACCESS VOID
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Animated Rings */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 4, opacity: [0, 0.1, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '400px',
              height: '400px',
              border: '1px solid #9333ea',
              borderRadius: '50%',
              margin: '-200px 0 0 -200px'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
