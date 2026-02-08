import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home, X, Send } from 'lucide-react';
import { forumApi } from '../api';
import Avatar from '../components/Avatar';
import { getIcon } from '../utils/icons';

const ForumView = () => {
  const { id } = useParams();
  const [forum, setForum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    const fetchForum = async () => {
      try {
        if (id) {
          const res = await forumApi.getForum(id);
          setForum(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch forum", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForum();
  }, [id]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post a thread.");
    if (!newThread.title.trim() || !newThread.content.trim()) return;

    try {
      const res = await forumApi.createThread({
        ...newThread,
        forumId: id,
        authorId: user.id
      });
      setShowModal(false);
      navigate(`/thread/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create thread", err);
      alert("Error creating thread. Check console.");
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Analyzing Void Board...</div>;
  if (!forum) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Forum not found in the Void.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      
      {/* Visual Header / Logo Area */}
      <div style={{ textAlign: 'center', padding: '2rem 0', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>GOJO<span style={{ color: 'white', fontWeight: 300 }}>FORUMS</span></h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
          <Home size={14} />
          <Link to="/home" style={{ color: 'var(--text-main)' }}>GojoVoid</Link>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{forum.name}</span>
        </div>
        
        <button
          onClick={() => user ? setShowModal(true) : alert("Please login to post a thread.")}
          style={{
            backgroundColor: '#006d7e',
            color: 'white',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={16} /> POST THREAD
        </button>
      </div>

      <div className="forum-block">
        <div className="forum-header">
          {getIcon(forum.icon, 16)} {forum.name.toUpperCase()}
        </div>

        {forum.threads.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            No threads found. Be the first to start a discussion!
          </div>
        ) : forum.threads.map((thread: any) => (
          <div 
            key={thread.id} 
            className="forum-row" 
            onClick={() => navigate(`/thread/${thread.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="forum-icon">
              <Avatar 
                src={thread.author.avatar} 
                name={thread.author.name} 
                size={32} 
              />
            </div>

            <div className="forum-info">
              <h3><Link to={`/thread/${thread.id}`}>{thread.title}</Link></h3>
              <p>by <span style={{ color: 'var(--secondary)' }}>{thread.author.name}</span> • {new Date(thread.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="forum-stats">
              <span className="stat-val">{thread._count.posts}</span>
              <span className="stat-lbl">Replies</span>
            </div>

            <div className="forum-stats">
              <span className="stat-val">{thread.views}</span>
              <span className="stat-lbl">Views</span>
            </div>

            <div className="forum-last-post">
              <div className="last-post-meta">
                by <span style={{ color: 'var(--primary)' }}>{thread.author.name}</span><br />
                {new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Thread Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '600px', padding: '2rem', border: '1px solid var(--primary)' }}
            >
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'white' }}>
                <X size={24} />
              </button>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>CREATE NEW THREAD</h2>
              
              <form onSubmit={handleCreateThread}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>THREAD TITLE</label>
                  <input 
                    type="text" 
                    value={newThread.title}
                    onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                    placeholder="Enter short, descriptive title..."
                    style={{ background: '#0a0a0a', border: '1px solid var(--glass-border)', padding: '0.8rem', width: '100%', color: 'white' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>CONTENT</label>
                  <textarea 
                    value={newThread.content}
                    onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                    placeholder="Write your discussion details here..."
                    style={{ background: '#0a0a0a', border: '1px solid var(--glass-border)', padding: '1rem', width: '100%', height: '200px', color: 'white', resize: 'vertical' }}
                  />
                </div>
                
                <button 
                  type="submit"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: 'black', 
                    width: '100%', 
                    padding: '1rem', 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Send size={18} /> INITIALIZE DISCUSSION
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForumView;
