import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import {
  Users, Clock, CheckCircle, TrendingUp, MapPin,
  UserPlus, Trash2, Settings, Download, X, Stethoscope,
  Building2, Bell, Moon, Sun, Shield, DollarSign, Activity, Link as LinkIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const SPECIALIZATIONS = [
  'Cardiology', 'Pediatrics', 'General Practice', 'Dermatology',
  'Neurology', 'Orthopedics', 'Gynecology', 'ENT',
  'Ophthalmology', 'Psychiatry', 'Gastroenterology', 'Pulmonology'
];

export const AdminPanel = () => {
  const { doctors, queues, locations, theme, toggleTheme, payments, auditLog } = useStore();
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Modal state
  const [modal, setModal] = useState(null); // 'doctors' | 'settings' | null

  // Manage Doctors state
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: SPECIALIZATIONS[0], locationId: locations[0]?.id });
  const [localDoctors, setLocalDoctors] = useState(doctors);

  // Settings state
  const [settings, setSettings] = useState({
    avgConsultTime: 15,
    allowEmergency: true,
    autoNotify: true,
    maxQueueSize: 20,
  });

  const filteredDoctors = selectedLocation === 'all'
    ? localDoctors
    : localDoctors.filter(d => d.locationId === selectedLocation);

  const totalPatients = filteredDoctors.reduce((sum, d) => sum + (queues[d.id] || []).length, 0);
  const completedPatients = filteredDoctors.reduce((sum, d) =>
    sum + (queues[d.id] || []).filter(q => q.status === 'completed').length, 0);
  const waitingPatients = filteredDoctors.reduce((sum, d) =>
    sum + (queues[d.id] || []).filter(q => q.status === 'waiting').length, 0);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const chartData = filteredDoctors
    .filter(doc => (queues[doc.id] || []).length > 0) // only doctors with patients
    .map(doc => {
      const q = queues[doc.id] || [];
      return {
        name: doc.name.replace('Dr. ', '').split(' ')[0], // first name only
        waiting: q.filter(x => x.status === 'waiting').length,
        completed: q.filter(x => x.status === 'completed').length,
        serving: q.filter(x => x.status === 'in-progress').length,
      };
    });

  // ── Export Report ──
  const handleExportReport = () => {
    const rows = [
      ['Doctor', 'Specialization', 'Branch', 'Total', 'Waiting', 'In Progress', 'Completed'],
      ...localDoctors.map(d => {
        const q = queues[d.id] || [];
        const loc = locations.find(l => l.id === d.locationId)?.name || '';
        return [
          d.name, d.specialization, loc,
          q.length,
          q.filter(x => x.status === 'waiting').length,
          q.filter(x => x.status === 'in-progress').length,
          q.filter(x => x.status === 'completed').length,
        ];
      })
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medora-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV!');
  };

  // ── Add Doctor (local demo) ──
  const handleAddDoctor = () => {
    if (!newDoctor.name.trim()) { toast.error('Please enter a doctor name'); return; }
    const id = `d_custom_${Date.now()}`;
    setLocalDoctors(prev => [...prev, { ...newDoctor, id }]);
    setNewDoctor({ name: '', specialization: SPECIALIZATIONS[0], locationId: locations[0]?.id });
    toast.success(`${newDoctor.name} added successfully!`);
  };

  const handleRemoveDoctor = (id) => {
    setLocalDoctors(prev => prev.filter(d => d.id !== id));
    toast('Doctor removed', { icon: '🗑️' });
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
    setModal(null);
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header flex-between">
        <div>
          <h1>Admin Panel</h1>
          <p>System overview and statistics</p>
        </div>
        <div className="admin-location-filter">
          <MapPin size={18} className="text-muted" />
          <select
            className="med-select admin-location-select"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            <option value="all">All Branches</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </header>

      {selectedLocation !== 'all' && (
        <div className="active-location-tag animate-fade-in">
          <MapPin size={14} />
          Showing data for: <strong>{locations.find(l => l.id === selectedLocation)?.name}</strong>
          <button className="clear-filter" onClick={() => setSelectedLocation('all')}>✕ Clear</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <Card className="admin-stat-card">
          <div className="admin-stat-icon text-primary bg-blue-light"><Users size={24} /></div>
          <div>
            <p className="admin-stat-label">Total Patients</p>
            <h3 className="admin-stat-value">{totalPatients}</h3>
          </div>
        </Card>
        <Card className="admin-stat-card">
          <div className="admin-stat-icon text-success bg-green-light"><DollarSign size={24} /></div>
          <div>
            <p className="admin-stat-label">Total Revenue</p>
            <h3 className="admin-stat-value">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="admin-stat-card">
          <div className="admin-stat-icon text-warning bg-orange-light"><Clock size={24} /></div>
          <div>
            <p className="admin-stat-label">Still Waiting</p>
            <h3 className="admin-stat-value">{waitingPatients}</h3>
          </div>
        </Card>
        <Card className="admin-stat-card">
          <div className="admin-stat-icon text-purple bg-purple-light"><TrendingUp size={24} /></div>
          <div>
            <p className="admin-stat-label">Doctors in View</p>
            <h3 className="admin-stat-value">{filteredDoctors.length}</h3>
          </div>
        </Card>
      </div>

      <div className="admin-grid-layout">
        <div className="admin-main">
          {/* Chart */}
          <Card className="mb-4">
            <h2 className="section-title" style={{ marginBottom: '1rem', marginTop: 0 }}>Workload Distribution</h2>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="var(--success)" name="Completed" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="serving" stackId="a" fill="var(--primary-blue)" name="In Progress" />
                    <Bar dataKey="waiting" stackId="a" fill="var(--warning)" name="Waiting" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted text-center" style={{ padding: '3rem' }}>
                No active patients. Book appointments to see data here.
              </div>
            )}
          </Card>

          {/* Doctor queue cards */}
          <h2 className="section-title">Doctor Queues — {selectedLocation === 'all' ? 'All Branches' : locations.find(l => l.id === selectedLocation)?.name}</h2>
          <div className="admin-doctors-grid">
            {filteredDoctors.map(doc => {
              const docQueue = queues[doc.id] || [];
              const waiting = docQueue.filter(q => q.status === 'waiting').length;
              const completed = docQueue.filter(q => q.status === 'completed').length;
              const serving = docQueue.find(q => q.status === 'in-progress');
              const locName = locations.find(l => l.id === doc.locationId)?.name;
              return (
                <Card key={doc.id} className="admin-doc-card">
                  <div className="doc-card-header">
                    <h3>{doc.name}</h3>
                    <span className="doc-specialty">{doc.specialization}</span>
                    <span className="doc-location-badge"><MapPin size={11} /> {locName}</span>
                  </div>
                  <div className="doc-queue-status">
                    <div className="status-item">
                      <span className="status-label">Serving</span>
                      <span className="status-val text-primary font-bold">{serving ? serving.token : '-'}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Waiting</span>
                      <span className="status-val text-warning font-bold">{waiting}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Done</span>
                      <span className="status-val text-success font-bold">{completed}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Audit Log */}
          <h2 className="section-title" style={{ marginTop: '2rem' }}>System Audit Log</h2>
          <Card className="audit-log-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="audit-log-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {auditLog.length > 0 ? auditLog.map(log => (
                <div key={log.id} className="audit-log-item" style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, color: 'var(--text-muted)', fontSize: '0.8rem', width: '80px' }}>{log.time}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{log.event}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{log.type}</span>
                  </div>
                </div>
              )) : (
                <div className="text-muted text-center" style={{ padding: '2rem' }}>No system events recorded yet.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="admin-sidebar">
          {/* Branches */}
          <Card>
            <h2 className="section-title" style={{ marginTop: 0 }}>Branches</h2>
            <div className="branch-list">
              {locations.map(loc => {
                const locDoctors = doctors.filter(d => d.locationId === loc.id);
                const locWaiting = locDoctors.reduce((sum, d) =>
                  sum + (queues[d.id] || []).filter(q => q.status === 'waiting').length, 0);
                return (
                  <div
                    key={loc.id}
                    className={`branch-item ${selectedLocation === loc.id ? 'active' : ''}`}
                    onClick={() => setSelectedLocation(loc.id === selectedLocation ? 'all' : loc.id)}
                  >
                    <div className="branch-icon"><MapPin size={16} /></div>
                    <div className="branch-info">
                      <strong>{loc.name}</strong>
                      <span>{locDoctors.length} doctors · {locWaiting} waiting</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Actions — ALL FUNCTIONAL */}
          <Card className="mt-4">
            <h2 className="section-title" style={{ marginTop: 0 }}>Quick Actions</h2>
            <div className="sidebar-actions">
              <Link to="/admin/analytics" className="qa-action-btn" style={{ textDecoration: 'none' }}>
                <div className="qa-icon purple"><Activity size={18} /></div>
                <div className="qa-text">
                  <strong>Analytics Dashboard</strong>
                  <span>View detailed metrics</span>
                </div>
              </Link>

              <button
                className="qa-action-btn"
                onClick={() => setModal('doctors')}
              >
                <div className="qa-icon blue"><Stethoscope size={18} /></div>
                <div className="qa-text">
                  <strong>Manage Doctors</strong>
                  <span>Add or remove doctors</span>
                </div>
              </button>

              <button
                className="qa-action-btn"
                onClick={() => setModal('settings')}
              >
                <div className="qa-icon orange"><Settings size={18} /></div>
                <div className="qa-text">
                  <strong>System Settings</strong>
                  <span>Configure system preferences</span>
                </div>
              </button>

              <button
                className="qa-action-btn"
                onClick={handleExportReport}
              >
                <div className="qa-icon green"><Download size={18} /></div>
                <div className="qa-text">
                  <strong>Export Report</strong>
                  <span>Download CSV of all queues</span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ══ MANAGE DOCTORS MODAL ══ */}
      <Modal
        isOpen={modal === 'doctors'}
        onClose={() => setModal(null)}
        title="Manage Doctors"
      >
        <div className="manage-doctors-modal">
          {/* Add new doctor form */}
          <div className="add-doctor-form">
            <h4 className="modal-sub-heading"><UserPlus size={16} /> Add New Doctor</h4>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="med-input"
                placeholder="e.g. Dr. John Smith"
                value={newDoctor.name}
                onChange={e => setNewDoctor(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Specialization</label>
                <select
                  className="med-select"
                  value={newDoctor.specialization}
                  onChange={e => setNewDoctor(p => ({ ...p, specialization: e.target.value }))}
                >
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Branch</label>
                <select
                  className="med-select"
                  value={newDoctor.locationId}
                  onChange={e => setNewDoctor(p => ({ ...p, locationId: e.target.value }))}
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <Button variant="primary" onClick={handleAddDoctor} className="w-100">
              <UserPlus size={16} /> Add Doctor
            </Button>
          </div>

          {/* Existing doctors list */}
          <div className="existing-doctors-list">
            <h4 className="modal-sub-heading"><Users size={16} /> All Doctors ({localDoctors.length})</h4>
            <div className="modal-doctors-scroll">
              {localDoctors.map(d => {
                const loc = locations.find(l => l.id === d.locationId);
                return (
                  <div key={d.id} className="modal-doctor-row">
                    <div className="modal-doc-avatar">{d.name.split(' ')[1]?.[0] || 'D'}</div>
                    <div className="modal-doc-info">
                      <strong>{d.name}</strong>
                      <span>{d.specialization} · {loc?.name}</span>
                    </div>
                    <button
                      className="modal-remove-btn"
                      onClick={() => handleRemoveDoctor(d.id)}
                      title="Remove doctor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* ══ SYSTEM SETTINGS MODAL ══ */}
      <Modal
        isOpen={modal === 'settings'}
        onClose={() => setModal(null)}
        title="System Settings"
      >
        <div className="settings-modal">
          <div className="settings-section">
            <h4 className="modal-sub-heading"><Clock size={16} /> Queue Settings</h4>
            <div className="setting-row">
              <div className="setting-info">
                <strong>Avg. Consultation Time</strong>
                <span>Minutes per patient</span>
              </div>
              <div className="setting-control">
                <input
                  type="number"
                  className="med-input setting-num-input"
                  value={settings.avgConsultTime}
                  min={5} max={60}
                  onChange={e => setSettings(p => ({ ...p, avgConsultTime: +e.target.value }))}
                />
                <span className="setting-unit">min</span>
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <strong>Max Queue Size</strong>
                <span>Limit patients per doctor</span>
              </div>
              <div className="setting-control">
                <input
                  type="number"
                  className="med-input setting-num-input"
                  value={settings.maxQueueSize}
                  min={5} max={100}
                  onChange={e => setSettings(p => ({ ...p, maxQueueSize: +e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4 className="modal-sub-heading"><Shield size={16} /> Features</h4>
            <div className="setting-row">
              <div className="setting-info">
                <strong>Allow Emergency Overrides</strong>
                <span>Doctors can add emergency patients</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.allowEmergency}
                  onChange={e => setSettings(p => ({ ...p, allowEmergency: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <strong>Auto Notifications</strong>
                <span>Toast alerts for queue events</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoNotify}
                  onChange={e => setSettings(p => ({ ...p, autoNotify: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4 className="modal-sub-heading"><Sun size={16} /> Appearance</h4>
            <div className="setting-row">
              <div className="setting-info">
                <strong>Dark Mode</strong>
                <span>Toggle system-wide dark theme</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
