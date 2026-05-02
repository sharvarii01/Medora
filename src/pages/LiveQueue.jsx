import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { MapPin } from 'lucide-react';
import './LiveQueue.css';

export const LiveQueue = () => {
  const { doctors, queues, locations, autoAdvanceQueue } = useStore();
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || '');
  const [simulationMode, setSimulationMode] = useState(false);

  // Live clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Simulation
  useEffect(() => {
    if (!simulationMode) return;
    const simTimer = setInterval(() => {
      autoAdvanceQueue();
    }, 5000); // advance every 5 seconds for demo
    return () => clearInterval(simTimer);
  }, [simulationMode, autoAdvanceQueue]);

  // Doctors at selected location
  const visibleDoctors = doctors.filter(d => d.locationId === selectedLocation);
  const locationName = locations.find(l => l.id === selectedLocation)?.name || '';

  return (
    <div className="live-queue-container animate-fade-in">
      {/* Header */}
      <header className="live-queue-header">
        <div className="live-queue-title">
          <h1>Live Queue Status</h1>
          <p className="pulse-indicator"><span className="dot"></span> Live Updates</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={simulationMode} 
              onChange={(e) => setSimulationMode(e.target.checked)} 
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            Simulation Mode {simulationMode && <span style={{ color: 'var(--warning)' }}>(Running)</span>}
          </label>
          <div className="live-queue-time">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Location Tabs */}
      <div className="location-tabs">
        {locations.map(loc => (
          <button
            key={loc.id}
            className={`location-tab ${selectedLocation === loc.id ? 'active' : ''}`}
            onClick={() => setSelectedLocation(loc.id)}
          >
            <MapPin size={16} />
            {loc.name}
          </button>
        ))}
      </div>

      {/* Branch Banner */}
      <div className="branch-banner animate-fade-in">
        <MapPin size={18} />
        <span>Now displaying: <strong>{locationName}</strong></span>
      </div>

      {/* Queue Boards */}
      {visibleDoctors.length > 0 ? (
        <div className="live-grid">
          {visibleDoctors.map(doc => {
            const queue = queues[doc.id] || [];
            const serving = queue.find(q => q.status === 'in-progress');
            const waiting = queue.filter(q => q.status === 'waiting').slice(0, 6);

            return (
              <Card key={doc.id} className="live-doc-card">
                <div className="doc-banner">
                  <h3>{doc.name}</h3>
                  <span>{doc.specialization}</span>
                </div>

                <div className="serving-section">
                  <h4>NOW SERVING</h4>
                  <div className="serving-token animate-pulse-slow">
                    {serving ? serving.token : '--'}
                  </div>
                  {serving && (
                    <p className="serving-name">{serving.patientName}</p>
                  )}
                </div>

                <div className="upcoming-section">
                  <h4>NEXT IN LINE</h4>
                  {waiting.length > 0 ? (
                    <div className="upcoming-list">
                      {waiting.map((w) => (
                        <div key={w.id} className={`upcoming-item ${w.isEmergency ? 'emg-item' : ''}`}>
                          <span className="upcoming-token">{w.token}</span>
                          {w.isEmergency && <span className="emg-badge">EMG</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Queue is empty</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="empty-location-state">
          <MapPin size={48} className="text-muted" />
          <h3>No doctors assigned to this branch yet.</h3>
          <p className="text-muted">Check back later or try another branch.</p>
        </div>
      )}
    </div>
  );
};
