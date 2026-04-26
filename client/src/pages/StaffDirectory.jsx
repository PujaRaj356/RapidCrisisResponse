import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Users, Mail, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const StaffDirectory = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        toast.error(data.message || 'Error loading directory');
      }
    } catch (err) {
      toast.error('Network error loading directory');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (res.ok) {
        toast.success(`${name} has been deleted.`);
        setUsers(users.filter(u => u._id !== id));
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div style={{ padding: '0 1rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Users className="text-accent" /> Staff & User Directory
      </h2>
      
      {isLoading ? (
        <div className="skeleton" style={{ height: '300px' }}></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {users.map(u => (
            <div key={u._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', position: 'relative' }}>
              
              {user._id !== u._id && (
                <button 
                  onClick={() => deleteUser(u._id, u.name)}
                  className="icon-btn" 
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                  title={`Delete ${u.name}`}
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{u.name}</h3>
                <span className="severity-badge" style={{ background: u.role === 'Admin' ? 'var(--danger)' : u.role === 'Staff' ? 'var(--accent)' : 'var(--glass-border)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                  {u.role}
                </span>
              </div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Mail size={14} /> {u.email}
              </p>
              {u.roomNumber && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Room: {u.roomNumber}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;
