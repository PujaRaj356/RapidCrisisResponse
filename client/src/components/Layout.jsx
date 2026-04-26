import { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import ChatBox from './ChatBox';
import Sidebar from './Sidebar';
import './Layout.css'; 

const Layout = () => {
  return (
    <div className="layout-container sass-layout">
      <Sidebar />

      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="main-content dashboard-main"
      >
        <Outlet />
      </motion.main>
      
      <ChatBox />
    </div>
  );
};

export default Layout;
