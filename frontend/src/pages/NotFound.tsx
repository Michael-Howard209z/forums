import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Background Effect */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ 
          position: 'absolute', 
          width: '800px', 
          height: '800px', 
          border: '1px solid var(--primary)', 
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 0
        }} 
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
            <ShieldAlert size={120} color="var(--primary)" style={{ opacity: 0.8 }} />
            <motion.div 
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <EyeOff size={40} color="var(--accent)" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '8px', marginBottom: '1rem', textShadow: '0 0 20px var(--primary)' }}
        >
          404 ERROR
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '1.5rem', letterSpacing: '2px' }}
        >
          UNAUTHORIZED ACCESS DETECTED
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.8', fontSize: '1.1rem' }}
        >
          You have wandered into the <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Infinite Void</span>. 
          This sector of the Forbidden Archives does not exist, or your cursed energy level is insufficient to perceive it.
          Attempting to breach these protocols will result in permanent exile to the Prison Realm.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button 
            onClick={() => navigate('/home')}
            style={{ 
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              color: 'black',
              padding: '1rem 3rem',
              borderRadius: '4px',
              fontWeight: '900',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 0 30px rgba(0, 218, 255, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Home size={20} /> RETURN TO REALITY
          </button>
        </motion.div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem', justifyContent: 'center', opacity: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
            <Lock size={12} /> ENCRYPTED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
             IP LOGGED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
             SIX EYES SCANNING
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
