import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, Search, Loader2, ArrowLeft } from 'lucide-react';
import { forumApi } from '../api';
import Avatar from '../components/Avatar';
import { useHeartbeat } from '../hooks/useHeartbeat';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedUserId = searchParams.get('user');
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!selectedUserId); // Hide sidebar on mobile when chat open
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  
  // Keep user marked as online
  useHeartbeat();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const res = await forumApi.getConversations();
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [currentUser, navigate]);

  const lastMessageTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      setShowSidebar(false); // Hide sidebar on mobile when selecting a user

      let mounted = true;

      const fetchInitialMessages = async () => {
        setMessagesLoading(true);
        try {
          const msgs = await forumApi.getChatHistory(selectedUserId);
          if (!mounted) return;
          setMessages(msgs);
          if (msgs.length) lastMessageTimestampRef.current = msgs[msgs.length - 1].createdAt;
        } catch (err) {
          console.error('Failed to fetch messages', err);
        } finally {
          setMessagesLoading(false);
        }
      };

      // fetch initial batch
      fetchInitialMessages();

      // Poll for new messages (only fetch deltas)
      const pollNewMessages = async () => {
        try {
          const since = lastMessageTimestampRef.current || undefined;
          const newMsgs = await forumApi.getChatHistory(selectedUserId, since);
          if (newMsgs && newMsgs.length) {
            setMessages(prev => [...prev, ...newMsgs]);
            lastMessageTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt;
          }
        } catch (err) {
          console.error('Failed to poll new messages', err);
        }
      };

      const messagesInterval = setInterval(pollNewMessages, 2000);

      return () => {
        mounted = false;
        clearInterval(messagesInterval);
      };
    } else {
      setShowSidebar(true);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const res = await forumApi.sendMessage({
        receiverId: selectedUserId,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      
      if (!conversations.find(c => c.id === selectedUserId)) {
         const partnerRes = await forumApi.getProfile(selectedUserId);
         setConversations([{ id: partnerRes.data.id, name: partnerRes.data.name, avatar: partnerRes.data.avatar }, ...conversations]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '10rem', color: 'var(--text-muted)' }}>Opening the Dimensional Gate...</div>;

  const currentChatPartner = conversations.find(c => c.id === selectedUserId);

  return (
    <div className="container" style={{ padding: '1rem 0', height: 'calc(100vh - 200px)', display: 'flex' }}>
      <div className="glass" style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '300px 1fr' : showSidebar ? '1fr' : '0fr 1fr', gap: 0, transition: 'grid-template-columns 0.3s' }}>
        
        {/* Sidebar - Conversations List */}
        <div style={{ 
          borderRight: window.innerWidth > 768 ? '1px solid var(--glass-border)' : 'none', 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.8rem' }}>MESSAGES</h2>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                style={{ width: '100%', background: '#0a0a0a', border: '1px solid var(--glass-border)', padding: '0.6rem 2.5rem 0.6rem 0.8rem', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
              />
              <Search size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                No messages yet.
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id}
                  onClick={() => navigate(`/messages?user=${conv.id}`)}
                  style={{ 
                    padding: '0.8rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.8rem', 
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === conv.id ? 'rgba(0, 218, 255, 0.05)' : 'transparent',
                    borderLeft: `3px solid ${selectedUserId === conv.id ? 'var(--primary)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <Avatar src={conv.avatar} name={conv.name} size={35} />
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Online</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
                {window.innerWidth <= 768 && (
                  <button 
                    onClick={() => navigate('/messages')}
                    style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <Avatar src={currentChatPartner?.avatar} name={currentChatPartner?.name || 'User'} size={35} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentChatPartner?.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#00ff7f' }}>● ACTIVE</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {messagesLoading ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ 
                        maxWidth: '85%', 
                        padding: '0.7rem 1rem', 
                        borderRadius: '12px',
                        backgroundColor: msg.senderId === currentUser.id ? 'var(--primary)' : '#222',
                        color: msg.senderId === currentUser.id ? 'black' : 'white',
                        fontSize: '0.85rem',
                        fontWeight: msg.senderId === currentUser.id ? '600' : '400',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ padding: '0.8rem', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.6rem' }}>
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    style={{ flex: 1, background: '#111', border: '1px solid var(--glass-border)', padding: '0.7rem', color: 'white', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="submit" 
                    style={{ background: 'var(--primary)', color: 'black', width: '44px', height: '44px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
              <h3 style={{ fontSize: '1.1rem' }}>SELECT A CONVERSATION</h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Your discussions are secure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
