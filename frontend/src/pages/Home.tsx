import { useState, useEffect } from 'react';
import { Home as HomeIcon, Layout, Map, Info, Megaphone, Shield, MessageSquare, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { forumApi } from '../api';
import { getIcon } from '../utils/icons';
import { useHeartbeat } from '../hooks/useHeartbeat';

const Home = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [latestThreads, setLatestThreads] = useState<any[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Keep user marked as online
  useHeartbeat();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, statRes, latestRes, onlineRes] = await Promise.all([
          forumApi.getCategories(),
          forumApi.getStats(),
          forumApi.getLatestThreads(),
          forumApi.getOnlineMembers()
        ]);
        setCategories(catRes.data);
        setStats(statRes.data);
        setLatestThreads(latestRes.data);
        setOnlineMembers(onlineRes.data.members || []);
      } catch (err) {
        console.error("Failed to fetch forum data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Poll online members every 10 seconds for real-time updates
    const interval = setInterval(async () => {
      try {
        const onlineRes = await forumApi.getOnlineMembers();
        setOnlineMembers(onlineRes.data.members || []);
      } catch (err) {
        console.error("Failed to fetch online members", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Visual Header / Logo Area */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 0',
        marginBottom: '1rem'
      }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          letterSpacing: '-2px',
          color: 'var(--primary)',
          textShadow: '0 0 40px rgba(0, 218, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          GOJO<span style={{ color: 'white', fontWeight: 300 }}>FORUMS</span>
        </h1>
        <p style={{ letterSpacing: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>THE STRONGEST UNDERGROUND</p>
      </div>

      {/* Alert / Announcement Bars */}
      <div className="forum-block">
        <div className="alert-bar alert-info">
          <Megaphone size={18} /> Welcome to the new GojoVoid forum. Please report any bugs in the Support section.
        </div>
        <div className="alert-bar alert-warning">
          <Shield size={18} /> Six Eyes Protection: Our server is protected by infinite void security protocols.
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <div className="category-tab active"><Map size={14} /> Main Categories</div>
        <div className="category-tab"><Layout size={14} /> Latest Content</div>
        <div className="category-tab"><Info size={14} /> Help & FAQ</div>
      </div>

      {/* Main Layout: Forum List + Sidebar */}
      <div className="home-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        
        {/* Forum Column */}
        <div>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Expanding Domain...</div>
          ) : categories.map((cat) => (
            <div key={cat.id} className="forum-block">
              <div className="forum-category-title">
                <HomeIcon size={16} /> {cat.name}
              </div>
              
              {cat.forums.map((forum: any) => (
                <div key={forum.id} className="forum-row" onClick={() => navigate(`/forum/${forum.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="forum-icon">
                    {getIcon(forum.icon, 22, "var(--primary)")}
                  </div>
                  
                  <div className="forum-info">
                    <h3><Link to={`/forum/${forum.id}`}>{forum.name}</Link></h3>
                    <p>{forum.description}</p>
                  </div>
                  
                  <div className="forum-stats">
                    <span className="stat-val">{forum._count.threads}</span>
                    <span className="stat-lbl">Threads</span>
                  </div>
                  
                  <div className="forum-stats">
                    <span className="stat-val">{forum.postCount || 0}</span>
                    <span className="stat-lbl">Posts</span>
                  </div>
                  
                  <div className="forum-last-post">
                    {forum.lastPost ? (
                      <>
                        <Link to={`/thread/${forum.lastPost.threadId}`} className="last-post-title">{forum.lastPost.title}</Link>
                        <div className="last-post-meta">
                          by <Link to={`/profile/${forum.lastPost.authorId}`} style={{ color: 'var(--primary)' }}>{forum.lastPost.authorName}</Link><br />
                          {new Date(forum.lastPost.date).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <div className="last-post-meta" style={{ fontStyle: 'italic', opacity: 0.5 }}>No missions yet</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="mobile-hide">
          <div className="sidebar-widget">
            <div className="widget-title"><MessageSquare size={14} /> LATEST UPDATES</div>
            <div className="widget-content">
              {latestThreads.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No updates yet.</div>
              ) : (
                latestThreads.map((thread) => (
                  <div key={thread.id} style={{ marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <Link to={`/thread/${thread.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                      {thread.title}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      by <Link to={`/profile/${thread.author.id}`} style={{ color: 'var(--secondary)' }}>{thread.author.name}</Link> • {new Date(thread.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="widget-title"><Zap size={14} /> COMMUNITY STATS</div>
            <div className="widget-content" style={{ fontSize: '0.85rem', lineHeight: '2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Threads:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalThreads || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Posts:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalPosts || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Members:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalUsers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Latest Member:</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>{stats?.newestUser || 'Loading...'}</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-widget">
            <div className="widget-title"><HomeIcon size={14} /> ONLINE MEMBERS</div>
            <div className="widget-content">
              {onlineMembers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No members online</div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    {onlineMembers.map((member) => (
                      <Link 
                        key={member.id}
                        to={`/profile/${member.id}`}
                        style={{ 
                          color: member.role === 'ADMIN' ? 'var(--accent)' : member.role === 'MOD' ? 'var(--secondary)' : 'var(--primary)',
                          fontWeight: 'bold' 
                        }}
                      >
                        {member.name}
                      </Link>
                    ))}
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Total: {onlineMembers.length} {onlineMembers.length === 1 ? 'user' : 'users'} online
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
