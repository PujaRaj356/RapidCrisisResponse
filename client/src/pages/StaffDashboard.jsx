import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { AlertTriangle, Clock, CheckCircle, Flame, HeartPulse, ShieldAlert, MessageSquare, Search, Filter, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import MapClusterView from '../components/MapClusterView';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('timeDesc');

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newIncident', (incident) => {
        setIncidents(prev => [incident, ...prev]);
        toast.error(`NEW EMERGENCY: ${incident.type} in Room ${incident.location?.roomNumber || 'Unknown'}`, {
          icon: <AlertTriangle />
        });
        
        // Critical Voice Warning Simulation
        if(incident.severity === 'Critical') {
            const audio = new Audio('https://commondatastorage.googleapis.com/codeskulptor-assets/Evillaugh.ogg');
            // Normally would be a siren sound or voice file.
            audio.play().catch(e => console.log('Audio blocked by browser config', e));
        }
      });

      socket.on('statusChange', (updatedIncident) => {
        setIncidents(prev => 
          prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc)
        );
        if(updatedIncident.status === 'Resolved'){
          toast.success(`Incident Resolved: ${updatedIncident.type}`);
        } else {
          toast.info(`Status Update: ${updatedIncident.type} is now ${updatedIncident.status}`);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('newIncident');
        socket.off('statusChange');
      }
    };
  }, [socket]);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/incidents', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      } else {
        toast.error(data.message || "Failed to load incidents");
        setIncidents([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading incidents");
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/incidents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Fire': return <Flame size={24} className="text-danger" />;
      case 'Medical': return <HeartPulse size={24} className="text-danger" />;
      case 'Security Threat': return <ShieldAlert size={24} className="text-warning" />;
      default: return <AlertTriangle size={24} className="text-warning" />;
    }
  };

  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    
    // Search
    if (searchTerm) {
      result = result.filter(inc => 
        inc.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.location?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Severity
    if (severityFilter !== 'All') {
      result = result.filter(inc => inc.severity === severityFilter);
    }

    // Filter by Status
    if (statusFilter !== 'All') {
      result = result.filter(inc => inc.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'timeDesc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'timeAsc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'severity') {
        const sevMap = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return sevMap[b.severity] - sevMap[a.severity];
      }
      return 0;
    });

    return result;
  }, [incidents, searchTerm, severityFilter, statusFilter, sortBy]);

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div>
          <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Command Center</h2>
          <p style={{color: 'var(--text-secondary)'}}>Real-time incident tracking and response matrix</p>
        </div>
        <div className="stats-row">
          <div className="stat-card glass-panel" style={{minWidth: '120px'}}>
            <h4 style={{color: 'var(--danger)'}}>Active Critical</h4>
            <span className="stat-num text-danger">{incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length}</span>
          </div>
          <div className="stat-card glass-panel" style={{minWidth: '120px'}}>
            <h4 style={{color: 'var(--accent)'}}>Total Active</h4>
            <span className="stat-num">{incidents.filter(i => i.status !== 'Resolved').length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Col: Incidents Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }}>
          
          <div className="filters-bar glass-panel" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-box" style={{flex: 1, position: 'relative'}}>
              <Search size={18} style={{position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)'}}/>
              <input 
                type="text" 
                placeholder="Search incidents, rooms..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{width: '100%', paddingLeft: '35px'}}
              />
            </div>
            
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{width: 'auto'}}>
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{width: 'auto'}}>
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Responding">Responding</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{width: 'auto'}}>
              <option value="timeDesc">Newest First</option>
              <option value="timeAsc">Oldest First</option>
              <option value="severity">Highest Severity</option>
            </select>
          </div>

          <div className="incident-list">
            <AnimatePresence>
              {isLoading ? (
                <>
                  <div className="incident-card glass-panel skeleton" style={{height: '180px'}}></div>
                  <div className="incident-card glass-panel skeleton" style={{height: '180px'}}></div>
                </>
              ) : filteredIncidents.map(incident => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={incident._id} 
                  className={`incident-card glass-panel status-${(incident.status || 'reported').toLowerCase()}`}
                  style={{boxShadow: incident.severity === 'Critical' && incident.status === 'Reported' ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'var(--glass-shadow)'}}
                >
                  <div className="inc-header">
                    <div className="inc-title">
                      {getIcon(incident.type)}
                      <h3>{incident.type}</h3>
                      <span className={`severity-badge ${(incident.severity || 'low').toLowerCase()}`}>
                        {incident.severity || 'Low'}
                      </span>
                    </div>
                    <div className="inc-time">
                      <Clock size={16} /> 
                      {incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </div>
                  </div>

                  <div className="inc-timeline">
                    {/* Visual Timeline of incident status progressions */}
                    <div className={`time-step ${['Acknowledged', 'Responding', 'Resolved'].includes(incident.status) ? 'active' : ''}`}>Ack</div>
                    <div className={`time-line ${['Responding', 'Resolved'].includes(incident.status) ? 'active' : ''}`}></div>
                    <div className={`time-step ${['Responding', 'Resolved'].includes(incident.status) ? 'active' : ''}`}>Resp</div>
                    <div className={`time-line ${incident.status === 'Resolved' ? 'active' : ''}`}></div>
                    <div className={`time-step ${incident.status === 'Resolved' ? 'active' : ''}`}>Rslvd</div>
                  </div>

                  <div className="inc-body" style={{marginTop: '1rem'}}>
                    <p><strong><MapPin size={14} inline='true'/> Location:</strong> Room {incident.location?.roomNumber || 'Unknown'}</p>
                    <p><strong>Details:</strong> {incident.description}</p>
                  </div>

                  <div className="inc-actions">
                    {incident.status === 'Reported' && (
                      <button className="btn-secondary" onClick={() => updateStatus(incident._id, 'Acknowledged')}>
                        Acknowledge
                      </button>
                    )}
                    {incident.status === 'Acknowledged' && (
                      <button className="btn-primary" onClick={() => updateStatus(incident._id, 'Responding')}>
                        Deploy Team
                      </button>
                    )}
                    {incident.status === 'Responding' && (
                      <button className="btn-success" onClick={() => updateStatus(incident._id, 'Resolved')}>
                        <CheckCircle size={18} /> Mark Resolved
                      </button>
                    )}
                    <button className="btn-outline">
                      <MessageSquare size={18} /> Chat Channel
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredIncidents.length === 0 && !isLoading && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="empty-state">No incidents match your criteria.</motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Col: Map & Aux Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MapClusterView incidents={incidents.filter(i => i.status !== 'Resolved')} />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
