import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { CheckCircle, AlertTriangle, SkipForward, Users, Search, Filter, Clock, FileText, Printer, Pill, Plus, Calendar as CalendarIcon, User } from 'lucide-react';
import toast from 'react-hot-toast';
import './DoctorDashboard.css';

export const DoctorDashboard = () => {
  const { user, doctors, queues, locations, updateAppointmentStatus, addEmergencyPatient, doctorAvailability, setDoctorAvailability, addPrescription, bookedSlots } = useStore();
  const [isEmergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [prescMed, setPrescMed] = useState({ name: '', dosage: '', duration: '' });
  const [prescNotes, setPrescNotes] = useState('');
  const [prescList, setPrescList] = useState([]);

  // Allow doctor to pick which doctor profile they're acting as
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const queue = queues[doctorId] || [];
  const activeDoctorInfo = doctors.find(d => d.id === doctorId);
  const activeDoctorLocation = locations.find(l => l.id === activeDoctorInfo?.locationId);

  const currentPatient = queue.find(q => q.status === 'in-progress');
  const waitingPatients = queue.filter(q => q.status === 'waiting');
  const completedPatients = queue.filter(q => q.status === 'completed');

  const upcomingBookings = bookedSlots.filter(s => s.doctorId === doctorId && s.date === new Date().toISOString().split('T')[0]);

  const startNextPatient = () => {
    if (waitingPatients.length > 0) {
      updateAppointmentStatus(doctorId, waitingPatients[0].id, 'in-progress');
    } else {
      toast('No waiting patients in queue', { icon: 'ℹ️' });
    }
  };

  const handleStatusChange = (id, status) => {
    updateAppointmentStatus(doctorId, id, status);
    if (status === 'completed') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      });
    }
  };

  const handleAddEmergency = () => {
    if (emergencyName.trim()) {
      addEmergencyPatient(doctorId, emergencyName);
      setEmergencyModalOpen(false);
      setEmergencyName('');
    }
  };

  const handleAddMedicine = () => {
    if (prescMed.name && prescMed.dosage) {
      setPrescList([...prescList, { ...prescMed }]);
      setPrescMed({ name: '', dosage: '', duration: '' });
    }
  };

  const handleSavePrescription = () => {
    if (!selectedPatient) return;
    addPrescription({
      id: `rx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      doctor: activeDoctorInfo.name,
      patient: selectedPatient.patientName,
      status: 'active',
      medicines: prescList,
      notes: prescNotes
    });
    toast.success('Prescription saved to patient record');
    setPrescriptionModalOpen(false);
    setPrescList([]);
    setPrescNotes('');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); startNextPatient(); }
      if (e.key.toLowerCase() === 'e') { e.preventDefault(); setEmergencyModalOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doctorId, waitingPatients]);

  const filteredQueue = queue.filter(q => {
    const matchesSearch = q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || q.token.toString().includes(searchQuery);
    const matchesFilter = filterStatus === 'all' ? true : q.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-container animate-fade-in print-container">
      <header className="dashboard-header flex-between no-print">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>{activeDoctorInfo?.name} · {activeDoctorInfo?.specialization} · <strong>{activeDoctorLocation?.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="med-select"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
            value={doctorId}
            onChange={e => { setDoctorId(e.target.value); setSelectedPatient(null); }}
          >
            {doctors.map(d => {
              const loc = locations.find(l => l.id === d.locationId);
              return <option key={d.id} value={d.id}>{d.name} ({loc?.name})</option>;
            })}
          </select>
          
          <select
            className="med-select"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
            value={doctorAvailability[doctorId] || 'available'}
            onChange={e => setDoctorAvailability(doctorId, e.target.value)}
          >
            <option value="available">🟢 Available</option>
            <option value="break">🟠 On Break</option>
            <option value="offline">🔴 Offline</option>
          </select>

          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </Button>

          <Button variant="danger" onClick={() => setEmergencyModalOpen(true)} title="Shortcut: E">
            <AlertTriangle size={18} /> Emergency
          </Button>
        </div>
      </header>

      {/* Print Header */}
      <div className="print-only">
        <h2>{activeDoctorInfo?.name} - Queue Sheet</h2>
        <p>Date: {new Date().toLocaleDateString()} | Branch: {activeDoctorLocation?.name}</p>
        <hr style={{ margin: '1rem 0' }} />
      </div>

      <div className="doctor-grid">
        <div className="main-panel">
          <Card className="current-patient-card no-print">
            <h2>Current Patient</h2>
            {currentPatient ? (
              <div className="current-patient-info">
                <div className="patient-avatar">{currentPatient.token}</div>
                <div className="patient-details">
                  <h3>{currentPatient.patientName}</h3>
                  <p className="text-muted">Token: {currentPatient.token}</p>
                </div>
                <div className="action-buttons">
                  <Button variant="success" onClick={() => handleStatusChange(currentPatient.id, 'completed')}>
                    <CheckCircle size={18} /> Complete
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange(currentPatient.id, 'skipped')}>
                    <SkipForward size={18} /> Skip
                  </Button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} className="text-muted mb-4" />
                <p>No patient is currently being served.</p>
                {waitingPatients.length > 0 && (
                  <Button variant="primary" className="mt-4" onClick={startNextPatient} title="Shortcut: N">
                    Start Next Patient (N)
                  </Button>
                )}
              </div>
            )}
          </Card>

          <Card className="queue-list-card mt-4">
            <div className="flex-between mb-4 no-print">
              <h2>Queue Management</h2>
              <div className="queue-controls">
                <div className="search-bar">
                  <Search size={16} className="search-icon" />
                  <input type="text" className="med-input search-input-sm" placeholder="Search patient..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="filter-select">
                  <Filter size={16} className="filter-icon" />
                  <select className="med-select select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="waiting">Waiting</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredQueue.length > 0 ? (
              <div className="queue-list">
                {filteredQueue.map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`queue-item ${patient.isEmergency ? 'emergency-item' : ''} ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPatient(patient)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="queue-item-token">{patient.token}</div>
                    <div className="queue-item-name">
                      {patient.patientName}
                      {patient.isEmergency && <span className="emergency-badge">Emergency</span>}
                    </div>
                    <div className="queue-item-status">
                      <span className={`status-badge status-${patient.status === 'in-progress' ? 'primary' : patient.status === 'waiting' ? 'warning' : 'success'}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-4">No patients found matching your criteria.</p>
            )}
          </Card>
        </div>

        <div className="side-panel no-print">
          <Card className="summary-card">
            <h2>Today's Summary</h2>
            <div className="summary-stats">
              <div className="summary-stat"><span className="stat-label">Total</span><span className="stat-num">{queue.length}</span></div>
              <div className="summary-stat"><span className="stat-label">Completed</span><span className="stat-num text-success">{completedPatients.length}</span></div>
              <div className="summary-stat"><span className="stat-label">Waiting</span><span className="stat-num text-warning">{waitingPatients.length}</span></div>
            </div>
          </Card>

          {upcomingBookings.length > 0 && (
            <Card className="mt-4">
              <h2><CalendarIcon size={18} style={{display:'inline', verticalAlign:'middle', marginRight:'0.4rem'}}/> Today's Bookings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {upcomingBookings.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span>{b.patientName}</span>
                    <strong>{b.time}</strong>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {selectedPatient && (
            <Card className="mt-4 patient-details-card animate-fade-in">
              <div className="flex-between mb-4">
                <h2>Patient Details</h2>
                <span className="token-badge">Token: {selectedPatient.token}</span>
              </div>
              <div className="details-row"><User className="text-muted mr-2" size={16} /><strong>{selectedPatient.patientName}</strong></div>
              <div className="details-row mt-2"><Clock className="text-muted mr-2" size={16} /><span>Status: <span style={{ textTransform: 'capitalize' }}>{selectedPatient.status}</span></span></div>
              
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <Button variant="primary" onClick={() => setPrescriptionModalOpen(true)} className="w-100 justify-center">
                  <Pill size={16} /> Write Prescription
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={isEmergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} title="Add Emergency Patient">
        <div className="form-group">
          <label>Patient Name</label>
          <input type="text" className="med-input" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Enter patient name" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button variant="outline" onClick={() => setEmergencyModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleAddEmergency}>Add to Queue</Button>
        </div>
      </Modal>

      <Modal isOpen={prescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)} title={`Prescription: ${selectedPatient?.patientName}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="presc-add-row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
            <div><label className="text-sm">Medicine</label><input type="text" className="med-input" value={prescMed.name} onChange={e=>setPrescMed({...prescMed, name: e.target.value})} placeholder="e.g. Paracetamol" /></div>
            <div><label className="text-sm">Dosage</label><input type="text" className="med-input" value={prescMed.dosage} onChange={e=>setPrescMed({...prescMed, dosage: e.target.value})} placeholder="e.g. 1-0-1" /></div>
            <div><label className="text-sm">Days</label><input type="text" className="med-input" value={prescMed.duration} onChange={e=>setPrescMed({...prescMed, duration: e.target.value})} placeholder="5" /></div>
            <Button variant="outline" onClick={handleAddMedicine}><Plus size={18} /></Button>
          </div>
          
          {prescList.length > 0 && (
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Added Medicines:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                {prescList.map((m, i) => <li key={i}>{m.name} — {m.dosage} ({m.duration} days)</li>)}
              </ul>
            </div>
          )}

          <div>
            <label className="text-sm">Clinical Notes</label>
            <textarea className="med-input w-100" rows="3" value={prescNotes} onChange={e => setPrescNotes(e.target.value)} placeholder="Diagnosis, lifestyle advice..."></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => setPrescriptionModalOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={handleSavePrescription}><CheckCircle size={16}/> Save to Records</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
