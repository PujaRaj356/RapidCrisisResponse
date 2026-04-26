import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { AlertCircle, MapPin, Camera, Mic, Loader2 } from 'lucide-react';
import './GuestDashboard.css';

const GuestDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  
  const [formData, setFormData] = useState({
    type: 'Medical',
    description: '',
    roomNumber: user?.roomNumber || '',
    image: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const handlePanic = async () => {
    setPanicMode(true);
    setIsSubmitting(true);
    
    const emergencyData = {
      type: 'Other',
      description: 'PANIC BUTTON PRESSED',
      severity: 'Critical',
      location: { roomNumber: user?.roomNumber || 'Unknown' }
    };
    
    await submitIncident(emergencyData);
  };

  const submitIncident = async (data) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Submission failed');
      
      const newIncident = await res.json();
      
      // Attempt to get AI classification running async
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gemini/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ description: data.description })
      }).then(r => r.json()).then(aiData => {
        setAiResponse(aiData);
      });
      
    } catch (error) {
      console.error(error);
      alert('Failed to report incident');
    } finally {
      setIsSubmitting(false);
      setFormData({...formData, description: ''});
      setTimeout(() => setPanicMode(false), 3000); // reset panic visual
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = {
      type: formData.type,
      description: formData.description,
      location: { roomNumber: formData.roomNumber }
    };
    submitIncident(data);
  };

  return (
    <div className="guest-dashboard">
      <div className="panic-zone">
        <button 
          className={`panic-btn ${panicMode ? 'active' : ''}`}
          onClick={handlePanic}
          disabled={isSubmitting}
        >
          <span>SOS</span>
          <div className="rings"></div>
        </button>
        <p className="panic-text">Press and hold in emergency</p>
      </div>

      <div className="report-card glass-panel">
        <h3>Report an Incident</h3>
        
        {aiResponse && (
          <div className={`ai-alert ${aiResponse.severity.toLowerCase()}`}>
            <strong>AI Assessment:</strong> {aiResponse.suggestions}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Emergency Type</label>
            <div className="type-grid">
              {['Fire', 'Medical', 'Security Threat', 'Natural Disaster', 'Other'].map(type => (
                <div 
                  key={type} 
                  className={`type-chip ${formData.type === type ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, type})}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <div className="desc-input-wrapper">
              <textarea 
                rows="4" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe what is happening..."
                required
              ></textarea>
              <button type="button" className="mic-btn"><Mic size={18} /></button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><MapPin size={16}/> Room / Location</label>
              <input 
                type="text" 
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label><Camera size={16}/> Photo Evidence</label>
              <input type="file" accept="image/*" className="file-input" />
            </div>
          </div>

          <button type="submit" className="primary-btn submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="spinner" /> : <AlertCircle size={20} />}
            {isSubmitting ? 'Reporting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestDashboard;
