import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const PlaceholderPage = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '10rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>{title.toUpperCase()}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>This section of the Forbidden Archives is currently being decoded.</p>
      <button 
        onClick={() => navigate('/home')}
        className="nav-btn-main active" 
        style={{ margin: '0 auto' }}
      >
        <Home size={16} /> RETURN TO MAIN ARCHIVES
      </button>
    </div>
  );
};

export const Upgrades = () => <PlaceholderPage title="Upgrades & Elite Ranks" />;
export const HiddenService = () => <PlaceholderPage title="Hidden Services" />;
export const Extras = () => <PlaceholderPage title="Void Extras" />;
