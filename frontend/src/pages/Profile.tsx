import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Shield, Zap, MapPin, Link as LinkIcon, Info, UserPlus, UserCheck, Camera, X } from 'lucide-react';
import { forumApi } from '../api';
import Avatar from '../components/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Avatar Selection State
  const [avatars, setAvatars] = useState<string[]>([]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (id) {
          const res = await forumApi.getProfile(id);
          setUser(res.data);
          
          if (currentUser && currentUser.id !== id) {
            const followRes = await forumApi.isFollowing(id);
            setIsFollowing(followRes.data.following);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser?.id]);

  const handleFollow = async () => {
    if (!currentUser) return navigate('/login');
    setFollowLoading(true);
    try {
      const res = await forumApi.toggleFollow(id!);
      setIsFollowing(res.data.followed);
      // Update local follower count
      setUser((prev: any) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: res.data.followed ? prev._count.followers + 1 : prev._count.followers - 1
        }
      }));
    } catch (err) {
      console.error("Follow error", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) return navigate('/login');
    navigate(`/messages?user=${id}`);
  };

  const openAvatarModal = async () => {
      try {
          const res = await forumApi.getAvatars();
          setAvatars(res.data);
          setIsAvatarModalOpen(true);
      } catch (e) {
          console.error("Failed to fetch avatars", e);
          alert("Could not load avatars");
      }
  };

  const handleUpdateAvatar = async (avatarPath: string) => {
      setUpdatingAvatar(true);
      try {
          const res = await forumApi.updateUserAvatar(avatarPath);
          setUser({ ...user, avatar: res.data.avatar });
          // Update local storage if it's the current user
          if (currentUser && currentUser.id === user.id) {
              const updatedUser = { ...currentUser, avatar: res.data.avatar };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              // Notify other components
              window.dispatchEvent(new Event("storage"));
          }
          setIsAvatarModalOpen(false);
      } catch (e) {
          console.error("Failed to update avatar", e);
          alert("Failed to update avatar");
      } finally {
          setUpdatingAvatar(false);
      }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Summoning Profile...</div>;
  if (!user) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>User not found in the Void.</div>;

  const isOwnProfile = currentUser?.id === id;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Cover and Avatar Header */}
      <div className="profile-header-container" style={{ position: 'relative', marginBottom: '8rem' }}>
        <div className="profile-cover" style={{ 
          height: '250px', 
          width: '100%', 
          backgroundImage: `url(${user.coverPhoto || 'https://images.unsplash.com/photo-1620336652075-efb7009c9462?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '0.5rem',
          border: '1px solid var(--glass-border)'
        }} />
        
        <div className="profile-header-content" style={{ 
          position: 'absolute',
          bottom: '-60px',
          left: '40px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2rem'
        }}>
          <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
            <Avatar 
              src={user.avatar} 
              name={user.name} 
              size={150} 
              borderRadius="0.5rem" 
              border="4px solid var(--bg-main)"
            />
            {isOwnProfile && (
                <button 
                    onClick={openAvatarModal}
                    title="Change Avatar"
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: '1px solid var(--primary)',
                        borderRadius: '50%',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <Camera size={20} />
                </button>
            )}
          </div>
          <div className="profile-header-text" style={{ paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.2rem', display: 'flex', alignItems: 'center' }}>
              {user.name} 
              {user.role === 'ADMIN' && <Shield size={24} style={{ marginLeft: '10px', color: 'var(--accent)' }} />}
            </h1>
            <div className="profile-meta" style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ 
                color: user.role === 'ADMIN' ? 'var(--accent)' : 'var(--primary)', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {user.role}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={14} /> {user.reputation} Reputation
              </span>
            </div>
          </div>
        </div>
        
        {!isOwnProfile && (
          <div className="profile-actions" style={{ position: 'absolute', bottom: '-40px', right: '40px', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleFollow}
              disabled={followLoading}
              style={{ 
                backgroundColor: isFollowing ? 'transparent' : 'var(--primary)', 
                color: isFollowing ? 'var(--primary)' : 'black', 
                padding: '0.7rem 1.5rem', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: isFollowing ? '1px solid var(--primary)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
              {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </button>
            <button 
              onClick={handleMessage}
              style={{ 
                backgroundColor: '#222', 
                color: 'white', 
                padding: '0.7rem 1.5rem', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={16} /> MESSAGE
            </button>
          </div>
        )}
      </div>

      <div className="home-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div>
          <div className="sidebar-widget">
            <div className="widget-title"><Zap size={14} /> STATISTICS</div>
            <div className="widget-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Threads:</span>
                  <span style={{ fontWeight: 'bold' }}>{user._count.threads}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Posts:</span>
                  <span style={{ fontWeight: 'bold' }}>{user._count.posts}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Like Score:</span>
                  <span style={{ fontWeight: 'bold' }}>{user.reputation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Followers:</span>
                  <span style={{ fontWeight: 'bold' }}>{user._count.followers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Following:</span>
                  <span style={{ fontWeight: 'bold' }}>{user._count.following}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
                  <span style={{ fontWeight: 'bold' }}>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="widget-title"><Info size={14} /> ABOUT</div>
            <div className="widget-content">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                {user.bio || "This user hasn't written a biography yet. A mysterious sorcerer."}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} color="var(--primary)" /> Kyoto Jujutsu High
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LinkIcon size={14} color="var(--primary)" /> <a href="https://guns.lol/_ngncx.hoang" style={{ color: 'var(--primary)' }}>nguyenhoang.vlxx</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div>
          <div className="category-tabs">
            <div className="category-tab active">Recent Activity</div>
            <div className="category-tab">Threads</div>
            <div className="category-tab">About</div>
          </div>

          <div className="forum-block">
            <div className="forum-header"><MessageSquare size={16} /> RECENT POSTS</div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderTop: 'none', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No recent public activity from this user.</p>
            </div>
          </div>
          
          {user.signature && (
            <div className="forum-block" style={{ marginTop: '2rem' }}>
              <div className="forum-header">SIGNATURE</div>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderTop: 'none', padding: '1.5rem', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {user.signature}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Avatar Selection Modal */}
        <AnimatePresence>
            {isAvatarModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAvatarModalOpen(false)}
                        style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass"
                        style={{ 
                            position: 'relative', 
                            width: '100%', 
                            maxWidth: '600px', 
                            maxHeight: '80vh', 
                            overflowY: 'auto',
                            padding: '2rem', 
                            background: '#111', 
                            border: '1px solid var(--primary)',
                            borderRadius: '8px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>SELECT AVATAR</h2>
                            <button onClick={() => setIsAvatarModalOpen(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={24} /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                            {avatars.map((path) => (
                                <div 
                                    key={path}
                                    onClick={() => handleUpdateAvatar(path)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        borderRadius: '8px', 
                                        overflow: 'hidden',
                                        border: user.avatar === path ? '2px solid var(--primary)' : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <img 
                                        src={path} 
                                        alt="avatar" 
                                        style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                                    />
                                    {user.avatar === path && (
                                        <div style={{ textAlign: 'center', fontSize: '0.7rem', background: 'var(--primary)', color: 'black', fontWeight: 'bold' }}>SELECTED</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {updatingAvatar && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                UPDATING...
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Profile;
