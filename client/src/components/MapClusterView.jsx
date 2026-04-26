import { useState, useMemo } from 'react';
import { MapPin, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Component since we don't have a real map library (e.g., leaflet or google maps) installed.
// We simulate a grid layout as a "Map" for UI demonstration.
const MapClusterView = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Group by severity for mock clusters
  const clusters = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    incidents.forEach(inc => {
      if (counts[inc.severity] !== undefined) counts[inc.severity]++;
    });
    return counts;
  }, [incidents]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
        <strong>Map Clusters:</strong>
        <span className="severity-badge critical">Critical ({clusters.Critical})</span>
        <span className="severity-badge high">High ({clusters.High})</span>
        <span className="severity-badge medium">Medium ({clusters.Medium})</span>
      </div>
      
      <div style={{ flex: 1, position: 'relative', background: 'repeating-linear-gradient(45deg, rgba(128,128,128,0.05) 0, rgba(128,128,128,0.05) 10px, transparent 10px, transparent 20px)' }}>
        
        {/* Mocking random positions for incidents */}
        {incidents.slice(0, 10).map((inc, i) => {
          // Stable pseudo-random based on id
          const seed = parseInt(inc._id.slice(-4), 16) || i * 1000;
          const top = `${(seed % 80) + 10}%`;
          const left = `${((seed * 3) % 80) + 10}%`;
          
          return (
            <motion.div
              key={inc._id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedIncident(inc)}
              style={{
                position: 'absolute',
                top, left,
                cursor: 'pointer',
                color: inc.severity === 'Critical' ? 'var(--danger)' : inc.severity === 'High' ? 'var(--warning)' : 'var(--accent)',
                zIndex: selectedIncident?._id === inc._id ? 10 : 1
              }}
            >
              <MapPin size={32} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} fill="currentColor" color="white" />
            </motion.div>
          );
        })}

        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: 'var(--glass-shadow)',
                border: '1px solid var(--glass-border)',
                width: '300px',
                zIndex: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0 }}>{selectedIncident.type}</h4>
                <button 
                  onClick={() => setSelectedIncident(null)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}
                >×</button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}><Info size={14} inline='true'/> {selectedIncident.location?.roomNumber || 'Unknown'}</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{selectedIncident.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapClusterView;
