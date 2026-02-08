import { Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'black',
            color: 'white',
            textAlign: 'center',
            padding: '2rem',
            zIndex: 9999,
            position: 'relative'
        }}>
            <Shield size={64} color="var(--primary)" className="animate-pulse" style={{ marginBottom: '2rem' }} />
            <h1 style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--primary)',
                textShadow: '0 0 20px var(--primary)',
                marginBottom: '1rem'
            }}>
                DOMAIN EXPANSION:<br/>INFINITE VOID
            </h1>
            <p style={{
                fontSize: '1.2rem',
                color: 'var(--text-muted)',
                maxWidth: '600px',
                marginBottom: '3rem',
                lineHeight: '1.6'
            }}>
                The system is currently undergoing critical maintenance. 
                All functions are temporarily suspended to ensure the stability of the Void.
                <br/><br/>
                <span style={{ color: 'var(--accent)' }}>Please check back later.</span>
            </p>
            
            <div className="alert-bar alert-warning" style={{ maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle size={24} />
                <span>MAINTENANCE MODE ACTIVE</span>
            </div>

            {user && user.role === 'ADMIN' ? (
                <button 
                    onClick={() => navigate('/admin')}
                    className="nav-btn-main active"
                    style={{ marginTop: '3rem' }}
                >
                    BYPASS VOID BARRIER (ADMIN)
                </button>
            ) : (
                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Staff Access Only</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="nav-btn-alt"
                    >
                        LOGIN TO SYSTEM
                    </button>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
