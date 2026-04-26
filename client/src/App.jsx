import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import GuestDashboard from './pages/GuestDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import StaffDirectory from './pages/StaffDirectory';

const OfflineUI = ({ children }) => {
//... (kept intact internally)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, []);

  return (
    <>
      {!isOnline && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#ef4444', color: 'white', textAlign: 'center', padding: '0.5rem', zIndex: 9999, fontWeight: 'bold' }}>
          Network Connection Lost / Reconnecting...
        </div>
      )}
      <div style={{ opacity: isOnline ? 1 : 0.6, pointerEvents: isOnline ? 'auto' : 'none' }}>
        {children}
      </div>
    </>
  );
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <OfflineUI>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={
              !user ? <Navigate to="/login" /> : 
              user.role === 'Guest' ? <GuestDashboard /> : <StaffDashboard />
            } />
            
            <Route path="/analytics" element={
              user?.role === 'Admin' ? <AdminAnalytics /> : <Navigate to="/" />
            } />

            <Route path="/staff" element={
              user?.role === 'Admin' ? <StaffDirectory /> : <Navigate to="/" />
            } />
          </Route>
        </Routes>
      </OfflineUI>
    </BrowserRouter>
  );
}

export default App;
