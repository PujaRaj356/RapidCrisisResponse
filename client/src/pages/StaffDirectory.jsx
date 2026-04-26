import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Users, Mail, ShieldAlert } from 'lucide-react';
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
      const res = await fetch('http://localhost:5000/api/users', {
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
            <div key={u._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
