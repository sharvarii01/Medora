import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { FlaskConical, Download, Clock, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import './LabReports.css';

const STATUS_CONFIG = {
  ready: { icon: CheckCircle, label: 'Ready', color: 'green' },
  processing: { icon: Clock, label: 'Processing', color: 'orange' },
  pending: { icon: AlertCircle, label: 'Pending', color: 'gray' },
};

export const LabReports = () => {
  const { labReports } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const types = ['All', ...new Set(labReports.map(r => r.type))];
  const filtered = labReports.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.orderedBy.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="labs-page animate-fade-in">
      <header className="labs-header">
        <h1><FlaskConical size={26} /> Lab Reports</h1>
        <p>View and download your test results</p>
      </header>

      {/* Summary */}
      <div className="labs-summary">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = labReports.filter(r => r.status === key).length;
          return (
            <Card key={key} className={`lab-sum-card sum-${cfg.color}`}>
              <Icon size={22} />
              <div>
                <h3>{count}</h3>
                <p>{cfg.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="labs-controls">
        <div className="search-bar labs-search">
          <Search size={18} className="search-icon" />
          <input type="text" className="med-input search-input" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="lab-type-chips">
          {types.map(t => (
            <button key={t} className={`cat-chip ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="labs-list">
        {filtered.map(report => {
          const cfg = STATUS_CONFIG[report.status];
          const Icon = cfg.icon;
          return (
            <Card key={report.id} className={`lab-card lab-card-${cfg.color}`}>
              <div className="lab-card-left">
                <div className={`lab-icon lab-icon-${cfg.color}`}><FlaskConical size={20} /></div>
                <div className="lab-info">
                  <h4>{report.name}</h4>
                  <p className="lab-meta">{report.type} · Ordered by {report.orderedBy} · {report.location}</p>
                  <p className="lab-date">{report.date}</p>
                </div>
              </div>
              <div className="lab-card-right">
                <span className={`lab-status-badge status-${cfg.color}`}>
                  <Icon size={13} /> {cfg.label}
                </span>
                {report.status === 'ready' && (
                  <button className="lab-download-btn" title="Download Report">
                    <Download size={16} /> Download
                  </button>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="labs-empty">
            <FlaskConical size={48} />
            <p>No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
