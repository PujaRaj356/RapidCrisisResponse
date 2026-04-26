import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BarChart, Activity, Users, Clock } from 'lucide-react';
import { LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    avgResponseTime: '0 mins',
    incidentsToday: 0,
    activeStaff: 0,
    resolvedRate: '0%'
  });
  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/stats`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setMetrics(data);
    } catch(e) {
      console.error(e);
    }
  };

  const trendData = [
    { name: 'Mon', incidents: 4 },
    { name: 'Tue', incidents: 8 },
    { name: 'Wed', incidents: 10 },
    { name: 'Thu', incidents: 5 },
    { name: 'Fri', incidents: 12 },
    { name: 'Sat', incidents: 16 },
    { name: 'Sun', incidents: 6 }
  ];

  const categoryData = [
    { name: 'Medical', count: 24 },
    { name: 'Fire', count: 3 },
    { name: 'Security', count: 12 },
    { name: 'Infrastructure', count: 8 }
  ];

  const heatmapMock = [
    { area: 'Lobby', incidents: 4, level: 'low' },
    { area: 'Pool', incidents: 1, level: 'low' },
    { area: 'Kitchen', incidents: 6, level: 'high' },
    { area: 'Floor 3', incidents: 2, level: 'low' },
    { area: 'Parking', incidents: 8, level: 'critical' },
  ];

  return (
    <div className="analytics-container">
      <div className="header-section">
        <h2><BarChart /> System Analytics</h2>
        <p>Real-time overview of crisis response performance</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <Clock className="text-warning" size={32} />
          <h3>{metrics.avgResponseTime}</h3>
          <p>Avg Response Time</p>
        </div>
        <div className="metric-card glass-panel">
          <Activity className="text-danger" size={32} />
          <h3>{metrics.incidentsToday}</h3>
          <p>Incidents Today</p>
        </div>
        <div className="metric-card glass-panel">
          <Users className="text-accent" size={32} />
          <h3>{metrics.activeStaff}</h3>
          <p>Active Staff Members</p>
        </div>
        <div className="metric-card glass-panel">
          <BarChart className="text-success" size={32} />
          <h3>{metrics.resolvedRate}</h3>
          <p>Resolution Rate</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card glass-panel flex-2" style={{ height: '400px' }}>
          <h3>Incident Frequency Trend</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="var(--danger)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass-panel flex-1">
          <h3>Location Hotspots</h3>
          <div className="heatmap">
            {heatmapMock.map((loc, i) => (
              <div key={i} className="heat-row">
                <span>{loc.area}</span>
                <div className="heat-bar-wrapper">
                  <div className={`heat-bar ${loc.level}`} style={{width: `${(loc.incidents/10)*100}%`}}></div>
                  <span className="heat-val">{loc.incidents}</span>
                </div>
              </div>
            ))}
          </div>
          
          <h3 style={{ marginTop: '2rem', fontSize: '1rem' }}>Category Splitting</h3>
          <ResponsiveContainer width="100%" height="150px">
            <ReBarChart data={categoryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
