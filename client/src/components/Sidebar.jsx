import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, BarChart, Bell, Settings, LogOut, Moon, Sun, Users } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <ShieldAlert size={20} /> },
  ];

  if (user?.role === 'Admin') {
    navLinks.push({ name: 'Analytics', path: '/analytics', icon: <BarChart size={20} /> });
    navLinks.push({ name: 'Staff Directory', path: '/staff', icon: <Users size={20} /> });
  }

  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="sidebar glass-panel"
    >
      <div className="sidebar-brand">
        <ShieldAlert className="brand-icon text-danger" size={28} />
        <h2>Rapid Crisis</h2>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map((link) => (
          <NavLink 
            to={link.path} 
            key={link.name} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user?.name?.charAt(0)}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <div className="footer-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn logout-btn" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
