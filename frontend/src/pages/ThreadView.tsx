import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Clock, Home, Heart } from 'lucide-react';
import { forumApi } from '../api';
import Avatar from '../components/Avatar';

const ThreadView = () => {
  const { id } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    const fetchThread = async () => {
      try {
        if (id) {
          const res = await forumApi.getThread(id);
          setThread(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch thread", err);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to reply.");
    if (!reply.trim()) return;

    try {
      await forumApi.createPost({
        content: reply,
        threadId: id,
        authorId: user.id
      });
      // Refresh thread to show new post
      const updated = await forumApi.getThread(id!);
      setThread(updated.data);
      setReply('');
    } catch (err) {
      console.error("Failed to post reply", err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return alert("Please login to like posts.");
    try {
      await forumApi.toggleLike(postId, user.id);
      // Refresh thread to show updated like count/status
      const updated = await forumApi.getThread(id!);
      setThread(updated.data);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Opening Thread...</div>;
  if (!thread) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Thread not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      
      {/* Visual Header / Logo Area */}
      <div style={{ textAlign: 'center', padding: '2rem 0', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary)' }}>GOJO<span style={{ color: 'white', fontWeight: 300 }}>FORUMS</span></h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2rem' }}>
        <Home size={14} />
        <Link to="/home" style={{ color: 'var(--text-main)' }}>GojoVoid</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link to={`/forum/${thread.forumId}`} style={{ color: 'var(--text-main)' }}>Forum</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{thread.title}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* OP Post */}
        <PostItem post={thread} isOP onLike={() => {}} />

        {/* Replies */}
        {thread.posts.map((post: any) => (
          <PostItem 
            key={post.id} 
            post={post} 
            onLike={() => handleLike(post.id)}
            currentUserId={user?.id}
          />
        ))}

        {/* Reply Box */}
        {user ? (
          <div className="forum-block" style={{ marginTop: '2rem' }}>
            <div className="forum-header">
              <Send size={16} /> QUICK REPLY
            </div>
            <div className="glass" style={{ padding: '1.5rem', borderTop: 'none' }}>
              <form onSubmit={handleReply}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your response..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    background: '#0a0a0a',
                    border: '1px solid var(--glass-border)',
                    padding: '1rem',
                    color: 'white',
                    marginBottom: '1rem',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'black',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  POST REPLY
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="announcement-box" style={{ marginTop: '2rem', justifyContent: 'center' }}>
            Please <Link to="/login" style={{ textDecoration: 'underline' }}>Login</Link> to join the discussion.
          </div>
        )}
      </div>
    </div>
  );
};

const PostItem = ({ post, isOP = false, onLike, currentUserId }: { post: any, isOP?: boolean, onLike: () => void, currentUserId?: string }) => {
  const isLiked = post.likes?.some((l: any) => l.userId === currentUserId);

  return (
    <div className="thread-post">
      {/* Author Sidebar */}
      <div className="post-sidebar">
        <Avatar 
          src={post.author.avatar} 
          name={post.author.name} 
          size={80} 
          borderRadius="4px" 
        />
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: post.author.role === 'ADMIN' ? '#ff0055' : 'var(--primary)' }}>
          <Link to={`/profile/${post.author.id}`}>{post.author.name}</Link>
        </div>
        <div style={{ 
          fontSize: '0.65rem', 
          marginTop: '0.4rem', 
          backgroundColor: post.author.role === 'ADMIN' ? '#ff0055' : '#333', 
          padding: '2px 8px', 
          borderRadius: '2px',
          display: 'inline-block',
          fontWeight: 'bold'
        }}>
          {post.author.role || 'MEMBER'}
        </div>
        
        <div className="mobile-hide" style={{ textAlign: 'left', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          <p>Joined: <b>{new Date(post.author.createdAt).toLocaleDateString()}</b></p>
        </div>
      </div>

      {/* Post Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          paddingBottom: '0.6rem', 
          marginBottom: '1rem', 
          borderBottom: '1px solid var(--glass-border)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={12} /> {new Date(post.createdAt).toLocaleString()}
          </div>
          <div style={{ fontWeight: 'bold' }}>#{isOP ? '1' : 'POST'}</div>
        </div>
        
        {isOP && <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 800 }}>{post.title}</h2>}
        
        <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>

        {post.author.signature && (
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            {post.author.signature}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
           {!isOP && (
             <button 
              onClick={onLike}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px', 
                background: isLiked ? 'rgba(255, 0, 85, 0.1)' : 'none', 
                color: isLiked ? '#ff0055' : 'var(--text-muted)',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                border: isLiked ? '1px solid #ff0055' : '1px solid transparent'
              }}
             >
               <Heart size={14} fill={isLiked ? '#ff0055' : 'none'} /> 
               {post.likes?.length || 0}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default ThreadView;
