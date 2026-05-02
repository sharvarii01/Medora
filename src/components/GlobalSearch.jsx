import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, X, Stethoscope, User, CreditCard, FlaskConical, Calendar } from 'lucide-react';
import './GlobalSearch.css';

const QUICK_LINKS = [
  { label: 'Book Appointment', icon: Calendar, path: '/patient/schedule', role: 'patient' },
  { label: 'Lab Reports', icon: FlaskConical, path: '/patient/labs', role: 'patient' },
  { label: 'Analytics Dashboard', icon: Stethoscope, path: '/admin/analytics', role: 'admin' },
];

export const GlobalSearch = ({ onClose }) => {
  const { doctors, payments, locations, user } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const doctorResults = q ? doctors.filter(d =>
    d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const paymentResults = q ? payments.filter(p =>
    p.invoice.toLowerCase().includes(q) || (p.doctor || '').toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const quickLinks = QUICK_LINKS.filter(l => !l.role || l.role === user?.role);

  const handleDoctorClick = (d) => {
    navigate(`/doctor/${d.id}/profile`);
    onClose();
  };

  return (
    <div className="gsearch-overlay" onClick={onClose}>
      <div className="gsearch-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="gsearch-input-row">
          <Search size={20} className="gsearch-icon" />
          <input
            ref={inputRef}
            type="text"
            className="gsearch-input"
            placeholder="Search doctors, invoices, specializations..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="gsearch-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="gsearch-body">
          {/* Quick Links */}
          {!q && (
            <div className="gsearch-section">
              <p className="gsearch-section-label">Quick Links</p>
              {quickLinks.map(link => {
                const Icon = link.icon;
                return (
                  <button key={link.path} className="gsearch-result-row" onClick={() => { navigate(link.path); onClose(); }}>
                    <div className="gsearch-res-icon blue"><Icon size={16} /></div>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Doctor Results */}
          {doctorResults.length > 0 && (
            <div className="gsearch-section">
              <p className="gsearch-section-label">Doctors</p>
              {doctorResults.map(d => {
                const loc = locations.find(l => l.id === d.locationId);
                return (
                  <button key={d.id} className="gsearch-result-row" onClick={() => handleDoctorClick(d)}>
                    <div className="gsearch-res-icon blue"><Stethoscope size={16} /></div>
                    <div className="gsearch-res-info">
                      <strong>{d.name}</strong>
                      <span>{d.specialization} · {loc?.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Payment Results */}
          {paymentResults.length > 0 && (
            <div className="gsearch-section">
              <p className="gsearch-section-label">Invoices</p>
              {paymentResults.map(p => (
                <button key={p.id} className="gsearch-result-row" onClick={() => { navigate('/patient/profile'); onClose(); }}>
                  <div className="gsearch-res-icon green"><CreditCard size={16} /></div>
                  <div className="gsearch-res-info">
                    <strong>{p.invoice}</strong>
                    <span>{p.type} · ₹{p.amount} · {p.date}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {q && doctorResults.length === 0 && paymentResults.length === 0 && (
            <div className="gsearch-empty">No results for "<strong>{query}</strong>"</div>
          )}
        </div>

        <div className="gsearch-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Select</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};
