import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, Search, Loader2 } from 'lucide-react';
import { forumApi } from '../api';
import Avatar from '../components/Avatar';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedUserId = searchParams.get('user');
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

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

  useEffect(() => {
    if (selectedUserId) {
      const fetchMessages = async () => {
        setMessagesLoading(true);
        try {
          const res = await forumApi.getChatHistory(selectedUserId);
          setMessages(res.data);
        } catch (err) {
          console.error("Failed to fetch messages", err);
        } finally {
          setMessagesLoading(false);
        }
      };
      fetchMessages();
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
      
      // Update conversations if it's a new partner
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
    <div className="container" style={{ padding: '2rem 0', height: '85vh', display: 'flex' }}>
      <div className="glass" style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '350px 1fr' }}>
        
        {/* Sidebar */}
        <div style={{ borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem' }}>PRIVATE MESSAGES</h2>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search Sorcerers..." 
                style={{ width: '100%', background: '#0a0a0a', border: '1px solid var(--glass-border)', padding: '0.6rem 2.5rem 0.6rem 1rem', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }}
              />
              <Search size={16} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No secret messages yet.
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id}
                  onClick={() => navigate(`/messages?user=${conv.id}`)}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === conv.id ? 'rgba(0, 218, 255, 0.05)' : 'transparent',
                    borderLeft: `3px solid ${selectedUserId === conv.id ? 'var(--primary)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <Avatar src={conv.avatar} name={conv.name} size={45} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.name.toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar src={currentChatPartner?.avatar} name={currentChatPartner?.name || 'User'} size={40} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{currentChatPartner?.name.toUpperCase()}</div>
                  <div style={{ fontSize: '0.7rem', color: '#00ff7f' }}>● ACTIVE IN THE VOID</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        maxWidth: '70%', 
                        padding: '0.8rem 1.2rem', 
                        borderRadius: '12px',
                        backgroundColor: msg.senderId === currentUser.id ? 'var(--primary)' : '#222',
                        color: msg.senderId === currentUser.id ? 'black' : 'white',
                        fontSize: '0.9rem',
                        fontWeight: msg.senderId === currentUser.id ? '600' : '400',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Enter your forbidden secret..."
                    style={{ flex: 1, background: '#111', border: '1px solid var(--glass-border)', padding: '1rem', color: 'white', borderRadius: '8px' }}
                  />
                  <button 
                    type="submit" 
                    style={{ background: 'var(--primary)', color: 'black', width: '50px', height: '50px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
              <h3>SELECT A CONVERSATION</h3>
              <p style={{ fontSize: '0.85rem' }}>Your private discussions are safe within the Infinity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
