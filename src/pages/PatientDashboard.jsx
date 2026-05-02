import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, Clock, Activity, ChevronRight, Search, FileText, MapPin, CheckCircle, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PatientDashboard.css';

export const PatientDashboard = () => {
  const { user, doctors, locations, bookAppointment, queues, getEstimatedWaitTime } = useStore();
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState(1); // 1 = location, 2 = doctor

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [toastShown, setToastShown] = useState(false);

  // Mock patient history
  const [history] = useState([
    { id: 'h1', date: '2023-10-12', doc: 'Dr. John Doe', reason: 'Annual Checkup' },
    { id: 'h2', date: '2023-05-04', doc: 'Dr. Sarah Smith', reason: 'Echocardiogram' },
  ]);

  let currentAppointment = null;
  let estimatedWait = 0;
  let currentServing = '-';

  if (activeAppointment) {
    const q = queues[activeAppointment.doctorId];
    if (q) {
      currentAppointment = q.find(app => app.id === activeAppointment.id);
      if (currentAppointment) {
        estimatedWait = getEstimatedWaitTime(activeAppointment.doctorId, currentAppointment.id);
        const servingToken = q.find(app => app.status === 'in-progress')?.token;
        currentServing = servingToken || (q.find(app => app.status === 'waiting')?.token || '-');
      }
    }
  }

  // Timer Initialization
  useEffect(() => {
    if (currentAppointment && currentAppointment.status === 'waiting') {
      if (timerSeconds === 0 || timerSeconds > estimatedWait * 60 + 60 || timerSeconds < estimatedWait * 60 - 60) {
        setTimerSeconds(estimatedWait * 60);
      }
    }
  }, [estimatedWait, currentAppointment]);

  // Timer Countdown
  useEffect(() => {
    if (timerSeconds <= 0 || !currentAppointment || currentAppointment.status !== 'waiting') return;
    const interval = setInterval(() => {
      setTimerSeconds(s => {
        const next = s - 1;
        if (next <= 180 && next > 0 && !toastShown) {
           toast.success('Your turn is approaching! Please prepare.', { icon: '🔔', duration: 5000 });
           setToastShown(true);
        }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, toastShown, currentAppointment]);

  const handleBook = () => {
    if (!selectedDoctor) return;
    const appointment = bookAppointment(selectedDoctor, user.name);
    setActiveAppointment(appointment);
    setToastShown(false);
    
    // Trigger confetti on successful booking
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    });
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
    setSelectedDoctor('');
    setSearchQuery('');
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setSelectedLocation('');
    setSelectedDoctor('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'status-warning';
      case 'in-progress': return 'status-primary';
      case 'completed': return 'status-success';
      default: return '';
    }
  };

  const locationDoctors = doctors.filter(doc =>
    doc.locationId === selectedLocation &&
    (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (secs) => {
    if (secs <= 0) return 'Turn due!';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header flex-between">
        <div>
          <h1>Patient Dashboard</h1>
          <p>Welcome back, <strong>{user?.name}</strong></p>
        </div>
        <Link to="/patient/profile">
          <Button variant="primary">
            <LayoutDashboard size={16} /> My Health Portal
          </Button>
        </Link>
      </header>

      <div className="patient-grid-layout">
        <div className="patient-main">
          {currentAppointment && currentAppointment.status !== 'completed' ? (
            <div>
              <div className="booking-steps mb-4">
                <span className="step-complete"><CheckCircle size={16}/> Location Selected</span>
                <span className="step-divider">›</span>
                <span className="step-complete"><CheckCircle size={16}/> Doctor Selected</span>
                <span className="step-divider">›</span>
                <span className="step-active">Queue Joined</span>
              </div>

              <div className="active-appointment-grid mb-4">
                <Card className="token-card text-center">
                  <h3 className="text-muted">Your Token Number</h3>
                  <div className="token-display">
                    <span className="token-number">{currentAppointment.token}</span>
                  </div>
                  <div className={`status-badge ${getStatusColor(currentAppointment.status)}`}>
                    {currentAppointment.status.replace('-', ' ').toUpperCase()}
                  </div>
                  <p className="mt-4">
                    <strong>Doctor:</strong> {doctors.find(d => d.id === currentAppointment.doctorId)?.name}
                  </p>
                  <p>
                    <strong>Branch:</strong> {locations.find(l => l.id === doctors.find(d => d.id === currentAppointment.doctorId)?.locationId)?.name}
                  </p>
                </Card>

                <div className="stats-column">
                  <Card className="stat-card">
                    <div className="stat-icon bg-blue-light">
                      <Activity className="icon-blue" />
                    </div>
                    <div className="stat-info">
                      <h4>Currently Serving</h4>
                      <div className="stat-value">{currentServing}</div>
                    </div>
                  </Card>

                  <Card className={`stat-card ${timerSeconds <= 180 && currentAppointment.status === 'waiting' ? 'pulse-urgent' : ''}`}>
                    <div className="stat-icon bg-orange-light">
                      <Clock className="icon-orange" />
                    </div>
                    <div className="stat-info">
                      <h4>Estimated Wait</h4>
                      <div className="stat-value" style={{ fontFamily: 'monospace', fontSize: '1.4rem' }}>
                        {currentAppointment.status === 'in-progress' ? 'It is your turn!' : formatTime(timerSeconds)}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card className="booking-card mb-4">
              <div className="booking-steps mb-4">
                <span className={step >= 1 ? (selectedLocation ? 'step-complete' : 'step-active') : 'step-inactive'}>
                  {selectedLocation ? <><CheckCircle size={16}/> Branch Selected</> : '1. Choose Branch'}
                </span>
                <span className="step-divider">›</span>
                <span className={step >= 2 ? 'step-active' : 'step-inactive'}>
                  2. Select Doctor
                </span>
                <span className="step-divider">›</span>
                <span className="step-inactive">3. Join Queue</span>
              </div>

              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="card-header-icon mb-4">
                    <MapPin size={24} className="icon-blue" />
                    <h2>Select a Hospital Branch</h2>
                  </div>
                  <p className="text-muted mb-4">Choose the Medora branch closest to you to see available doctors.</p>
                  <div className="location-grid">
                    {locations.map(loc => {
                      const locDoctors = doctors.filter(d => d.locationId === loc.id);
                      const totalWaiting = locDoctors.reduce((sum, d) => sum + (queues[d.id] || []).filter(q => q.status === 'waiting').length, 0);
                      return (
                        <div
                          key={loc.id}
                          className="location-card"
                          onClick={() => handleLocationSelect(loc.id)}
                        >
                          <div className="location-icon"><MapPin size={28} /></div>
                          <h3>{loc.name}</h3>
                          <div className="location-meta">
                            <span>{locDoctors.length} Doctors</span>
                            <span className="sep">·</span>
                            <span className="text-warning">{totalWaiting} Waiting</span>
                          </div>
                          <Button variant="primary" className="mt-4 w-100">Select Branch</Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="step2-header mb-4">
                    <div className="card-header-icon">
                      <Calendar size={24} className="icon-blue" />
                      <h2>Available Doctors — {locations.find(l => l.id === selectedLocation)?.name}</h2>
                    </div>
                    <button className="back-btn" onClick={handleBackToStep1}>← Change Branch</button>
                  </div>

                  <div className="search-bar mb-4">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="med-input search-input"
                      placeholder="Search by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="doctor-selection-list">
                    {locationDoctors.length > 0 ? locationDoctors.map(doc => (
                      <div
                        key={doc.id}
                        className={`doc-select-item ${selectedDoctor === doc.id ? 'selected' : ''}`}
                        onClick={() => setSelectedDoctor(doc.id)}
                      >
                        <div className="doc-avatar">{doc.name.split(' ')[1]?.[0] || 'D'}</div>
                        <div className="doc-info">
                          <h4>{doc.name}</h4>
                          <span className="text-sm text-muted">{doc.specialization}</span>
                        </div>
                        <div className="doc-queue-info">
                          <span className="queue-pill">
                            {(queues[doc.id] || []).filter(q => q.status === 'waiting').length} waiting
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="empty-state-small">
                        <p className="text-muted">No doctors match "{searchQuery}"</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleBook}
                    disabled={!selectedDoctor}
                    className="mt-4 w-100"
                  >
                    Join Queue <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="patient-sidebar">
          <Card>
            <div className="card-header-icon mb-4">
              <FileText size={20} className="text-muted" />
              <h3>Medical History</h3>
            </div>
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-date">{item.date}</div>
                  <div className="history-doc font-bold">{item.doc}</div>
                  <div className="history-reason text-sm text-muted">{item.reason}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
