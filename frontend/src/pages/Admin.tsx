import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MessageSquare, Settings, BarChart, Trash2, Pin, Lock, Save, Layers, Plus, Edit2, ClipboardList, FolderPlus } from 'lucide-react';
import { forumApi } from '../api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [initialCheck, setInitialCheck] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'forum'>('category');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/home');
    } else {
      setInitialCheck(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (initialCheck || !user || user.role !== 'ADMIN') return;

    const fetchData = async () => {
      try {
        if (activeTab === 'dashboard') {
          const res = await forumApi.getStats();
          setStats(res.data);
        } else if (activeTab === 'content') {
          const res = await forumApi.adminGetThreads();
          setThreads(res.data);
        } else if (activeTab === 'users') {
          const res = await forumApi.adminGetUsers();
          setUsers(res.data);
        } else if (activeTab === 'settings') {
          const res = await forumApi.adminGetSettings();
          setSettings(res.data);
        } else if (activeTab === 'structure') {
          const res = await forumApi.adminGetAllCategories();
          setCategories(res.data);
        } else if (activeTab === 'logs') {
          const res = await forumApi.adminGetAuditLogs();
          setAuditLogs(res.data);
        }
      } catch (err) {
        console.error("Admin data fetch error", err);
      } finally {
      }
    };
    fetchData();
  }, [initialCheck, activeTab]);

  // --- Handlers ---

  const handleDeleteThread = async (id: string) => {
    if (!window.confirm("Xóa chủ đề này và tất cả các bình luận của nó?")) return;
    try {
      await forumApi.adminDeleteThread(id);
      setThreads(threads.filter(t => t.id !== id));
    } catch (err) { alert("Failed."); }
  };

  const handleUpdateThread = async (id: string, data: any) => {
    try {
      await forumApi.adminUpdateThread(id, data);
      setThreads(threads.map(t => t.id === id ? { ...t, ...data } : t));
    } catch (err) { alert("Failed."); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Xóa vĩnh viễn người dùng và tất cả nội dung?")) return;
    try {
      await forumApi.adminDeleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) { alert("Failed."); }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await forumApi.adminUpdateUserRole(id, role);
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    } catch (err) { alert("Failed."); }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      await forumApi.adminUpdateSetting(key, value);
      const res = await forumApi.adminGetSettings();
      setSettings(res.data);
      alert("Saved!");
    } catch (err) { alert("Failed."); }
  };

  // Structure Handlers
  const openModal = (type: 'category' | 'forum', item?: any, parentId?: string) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item ? { ...item } : { name: '', description: '', order: 0, categoryId: parentId || '' });
    setIsModalOpen(true);
  };

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'category') {
        if (editingItem) {
          await forumApi.adminUpdateCategory(editingItem.id, formData);
        } else {
          await forumApi.adminCreateCategory(formData);
        }
      } else {
        if (editingItem) {
          await forumApi.adminUpdateForum(editingItem.id, formData);
        } else {
          await forumApi.adminCreateForum(formData);
        }
      }
      setIsModalOpen(false);
      // Refresh
      const res = await forumApi.adminGetAllCategories();
      setCategories(res.data);
    } catch (err) {
      alert("Operation failed.");
    }
  };

  const handleDeleteStructure = async (type: 'category' | 'forum', id: string) => {
     if(!window.confirm(`Delete this ${type}? Nội dung có thể bị mất.`)) return;
     try {
        if(type === 'category') await forumApi.adminDeleteCategory(id);
        else await forumApi.adminDeleteForum(id);
        const res = await forumApi.adminGetAllCategories();
        setCategories(res.data);
     } catch(err) { alert("Failed."); }
  };

  if (initialCheck) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Shield size={32} color="var(--primary)" />
        <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>ADMIN CONTROL PANEL</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div className="glass" style={{ padding: '1rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AdminTabItem icon={<BarChart size={16} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <AdminTabItem icon={<Layers size={16} />} label="Structure" active={activeTab === 'structure'} onClick={() => setActiveTab('structure')} />
            <AdminTabItem icon={<MessageSquare size={16} />} label="Content" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
            <AdminTabItem icon={<Users size={16} />} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <AdminTabItem icon={<ClipboardList size={16} />} label="Audit Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
            <AdminTabItem icon={<Settings size={16} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '400px', position: 'relative' }}>


          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<Users size={20} />} value={stats?.totalUsers || 0} label="USERS" color="var(--primary)" />
                <StatCard icon={<MessageSquare size={20} />} value={stats?.totalThreads || 0} label="THREADS" color="var(--secondary)" />
                <StatCard icon={<BarChart size={20} />} value={stats?.totalPosts || 0} label="POSTS" color="var(--accent)" />
              </div>
              <div className="forum-block">
                <div className="forum-header">SYSTEM OVERVIEW</div>
                <div className="glass" style={{ padding: '2rem', borderTop: 'none' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Welcome, {user?.name}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Systems operational.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Forum Structure</h2>
                 <button className="nav-btn-main active" onClick={() => openModal('category')}>
                    <FolderPlus size={16} /> ADD CATEGORY
                 </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {categories.map(cat => (
                  <div key={cat.id} className="forum-block">
                     <div className="forum-header" style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{cat.name}</span>
                           <span style={{ fontSize: '0.8rem', opacity: 0.6, background: '#333', padding: '2px 6px', borderRadius: '4px' }}>Ord: {cat.order}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button onClick={() => openModal('forum', null, cat.id)} title="Add Forum" style={{ padding: '4px', background: 'var(--primary)', color: 'black', borderRadius: '4px' }}><Plus size={14} /></button>
                           <button onClick={() => openModal('category', cat)} title="Edit Category" style={{ padding: '4px', background: '#333', color: 'white', borderRadius: '4px' }}><Edit2 size={14} /></button>
                           <button onClick={() => handleDeleteStructure('category', cat.id)} title="Delete Category" style={{ padding: '4px', background: 'rgba(255,0,0,0.2)', color: 'red', borderRadius: '4px' }}><Trash2 size={14} /></button>
                        </div>
                     </div>
                     <div className="glass" style={{ borderTop: 'none', padding: '0' }}>
                        {cat.forums.length === 0 ? (
                           <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>Không có diễn đàn nào trong chuyên mục này.</div>
                        ) : (
                           cat.forums.map((forum: any) => (
                              <div key={forum.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontWeight: 'bold' }}>{forum.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{forum.description}</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Ord: {forum.order}</span>
                                    <button onClick={() => openModal('forum', forum)} style={{ padding: '4px', background: 'transparent', color: 'var(--text-muted)' }}><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteStructure('forum', forum.id)} style={{ padding: '4px', background: 'transparent', color: '#ff4444' }}><Trash2 size={14} /></button>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <ContentTable threads={threads} onUpdate={handleUpdateThread} onDelete={handleDeleteThread} />
          )}

          {activeTab === 'users' && (
            <UserTable users={users} currentUserId={user.id} onUpdateRole={handleUpdateRole} onDelete={handleDeleteUser} />
          )}

          {activeTab === 'logs' && (
            <div className="animate-fade-in">
              <div className="forum-block">
                <div className="forum-header">AUDIT LOGS</div>
                <div className="glass" style={{ borderTop: 'none', padding: '0' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                         <tr>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Admin</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Target</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Details</th>
                         </tr>
                      </thead>
                      <tbody>
                         {auditLogs.map(log => (
                            <tr key={log.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                               <td style={{ padding: '10px', opacity: 0.7 }}>{new Date(log.createdAt).toLocaleString()}</td>
                               <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>{log.admin.name}</td>
                               <td style={{ padding: '10px' }}><span style={{ background: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{log.action}</span></td>
                               <td style={{ padding: '10px' }}>{log.target}</td>
                               <td style={{ padding: '10px', opacity: 0.6, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in">
               <div className="forum-block">
                <div className="forum-header">CẤU HÌNH HỆ THỐNG</div>
                <div className="glass" style={{ borderTop: 'none', padding: '2rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <SettingRow label="Tên diễn đàn" initialValue={settings.find(s => s.key === 'site_name')?.value || "GojoVoid"} onSave={(val: string) => handleSaveSetting('site_name', val)} />
                      <SettingToggle label="Chế độ bảo trì" initialValue={settings.find(s => s.key === 'maintenance')?.value || "false"} onSave={(val: string) => handleSaveSetting('maintenance', val)} />
                      <SettingToggle label="Mở đăng ký" initialValue={settings.find(s => s.key === 'reg_open')?.value || "true"} onSave={(val: string) => handleSaveSetting('reg_open', val)} />
                   </div>
                </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Structure Modal */}
      {isModalOpen && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
            <div className="glass" style={{ width: '400px', padding: '2rem', background: '#111' }}>
               <h3 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit' : 'Create'} {modalType === 'category' ? 'Category' : 'Forum'}</h3>
               <form onSubmit={handleStructureSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                     placeholder="Name" 
                     value={formData.name} 
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     style={{ padding: '0.8rem', background: '#222', border: '1px solid var(--glass-border)', color: 'white' }}
                     required
                  />
                  <input 
                     placeholder="Description" 
                     value={formData.description || ''} 
                     onChange={e => setFormData({...formData, description: e.target.value})}
                     style={{ padding: '0.8rem', background: '#222', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <input 
                        type="number" 
                        placeholder="Order" 
                        value={formData.order} 
                        onChange={e => setFormData({...formData, order: e.target.value})}
                        style={{ padding: '0.8rem', background: '#222', border: '1px solid var(--glass-border)', color: 'white', flex: 1 }}
                     />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                     <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.6rem 1rem', background: 'transparent', color: 'var(--text-muted)' }}>Cancel</button>
                     <button type="submit" style={{ padding: '0.6rem 1rem', background: 'var(--primary)', color: 'black', fontWeight: 'bold' }}>Save</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

// Helper Components
const AdminTabItem = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '4px', backgroundColor: active ? 'var(--primary)' : 'transparent', color: active ? 'black' : 'var(--text-main)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
    {icon} {label}
  </div>
);

const StatCard = ({ icon, value, label, color }: any) => (
  <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
    <div style={{ color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{value}</div>
    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>{label}</div>
  </div>
);

const SettingRow = ({ label, initialValue, onSave }: { label: string, initialValue: string, onSave: (val: string) => void }) => {
  const [val, setVal] = useState(initialValue);
  useEffect(() => { setVal(initialValue); }, [initialValue]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={val} onChange={(e) => setVal(e.target.value)} style={{ flex: 1, background: '#0a0a0a', border: '1px solid var(--glass-border)', padding: '0.6rem', color: 'white', fontSize: '0.85rem' }} />
        <button onClick={() => onSave(val)} style={{ background: 'var(--primary)', color: 'black', padding: '0.6rem', borderRadius: '4px' }}><Save size={18} /></button>
      </div>
    </div>
  )
};

const SettingToggle = ({ label, initialValue, onSave }: { label: string, initialValue: string, onSave: (val: string) => void }) => {
  const [isChecked, setIsChecked] = useState(initialValue === 'true');
  
  useEffect(() => { setIsChecked(initialValue === 'true'); }, [initialValue]);

  const handleToggle = () => {
    const newVal = !isChecked;
    setIsChecked(newVal);
    onSave(newVal ? 'true' : 'false');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '1rem' }}>
        <label className="switch">
          <input type="checkbox" checked={isChecked} onChange={handleToggle} />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

const ContentTable = ({ threads, onUpdate, onDelete }: any) => (
  <div className="forum-block">
    <div className="forum-header">QUẢN LÝ CHỦ ĐỀ</div>
    <div className="glass" style={{ borderTop: 'none', padding: '0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
          <tr>
            <th style={{ padding: '1rem', textAlign: 'left' }}>THREAD</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>AUTHOR</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {threads.map((t: any) => (
            <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 'bold', color: t.isPinned ? 'var(--accent)' : 'inherit' }}>
                  {t.isPinned && <Pin size={12} style={{ marginRight: '6px' }} />}
                  {t.title}
                  {t.isLocked && <Lock size={12} style={{ marginLeft: '6px', opacity: 0.5 }} />}
                </div>
              </td>
              <td style={{ padding: '1rem' }}>{t.author.name}</td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => onUpdate(t.id, { isPinned: !t.isPinned })} title="Toggle Pin" style={{ padding: '4px' }}><Pin size={14} /></button>
                  <button onClick={() => onUpdate(t.id, { isLocked: !t.isLocked })} title="Toggle Lock" style={{ padding: '4px' }}><Lock size={14} /></button>
                  <button onClick={() => onDelete(t.id)} title="Delete" style={{ padding: '4px', color: '#ff4444' }}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const UserTable = ({ users, currentUserId, onUpdateRole, onDelete }: any) => (
  <div className="forum-block">
    <div className="forum-header">QUẢN LÝ NGƯỜI DÙNG</div>
    <div className="glass" style={{ borderTop: 'none', padding: '0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
          <tr>
             <th style={{ padding: '1rem', textAlign: 'left' }}>TÊN</th>
             <th style={{ padding: '1rem', textAlign: 'center' }}>ROLE</th>
             <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
             <tr key={u.id}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.name}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                   <select value={u.role} onChange={(e) => onUpdateRole(u.id, e.target.value)} style={{ background: '#111', color: 'white', border: '1px solid #333' }}>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIP">VIP</option>
                      <option value="MOD">MOD</option>
                      <option value="ADMIN">ADMIN</option>
                   </select>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                   <button onClick={() => onDelete(u.id)} disabled={u.id === currentUserId} style={{ color: '#ff4444' }}>EXILE</button>
                </td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Admin;
