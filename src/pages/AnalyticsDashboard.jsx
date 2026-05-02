import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { MapPin, Star, CheckCircle, Clock, AlertCircle, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './AnalyticsDashboard.css';

const COLORS = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

// Simulated hourly patient flow
const HOURLY_DATA = [
  { hour: '8AM', patients: 3, completed: 1 },
  { hour: '9AM', patients: 8, completed: 5 },
  { hour: '10AM', patients: 14, completed: 10 },
  { hour: '11AM', patients: 18, completed: 13 },
  { hour: '12PM', patients: 10, completed: 8 },
  { hour: '1PM', patients: 6, completed: 5 },
  { hour: '2PM', patients: 12, completed: 8 },
  { hour: '3PM', patients: 16, completed: 12 },
  { hour: '4PM', patients: 9, completed: 7 },
  { hour: '5PM', patients: 4, completed: 4 },
];

const SPECIALTY_DEMAND = [
  { name: 'Cardiology', visits: 42 },
  { name: 'General Practice', visits: 87 },
  { name: 'Pediatrics', visits: 63 },
  { name: 'Dermatology', visits: 35 },
  { name: 'Neurology', visits: 28 },
  { name: 'Orthopedics', visits: 31 },
  { name: 'ENT', visits: 24 },
  { name: 'Ophthalmology', visits: 19 },
];

export const AnalyticsDashboard = () => {
  const { doctors, queues, payments, ratings } = useStore();
  const [tab, setTab] = useState('flow');

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const consultRevenue = payments.filter(p => p.type === 'Consultation').reduce((s, p) => s + p.amount, 0);
  const pharmRevenue = payments.filter(p => p.type === 'Pharmacy').reduce((s, p) => s + p.amount, 0);

  const revenuePieData = [
    { name: 'Consultations', value: consultRevenue },
    { name: 'Pharmacy', value: pharmRevenue },
  ];

  const doctorPerformance = doctors.map(d => {
    const q = queues[d.id] || [];
    const doctorRatings = ratings[d.id] || [];
    const avgRating = doctorRatings.length ? (doctorRatings.reduce((s, r) => s + r.stars, 0) / doctorRatings.length).toFixed(1) : '—';
    return {
      ...d,
      total: q.length,
      completed: q.filter(x => x.status === 'completed').length,
      waiting: q.filter(x => x.status === 'waiting').length,
      avgRating,
      ratingCount: doctorRatings.length
    };
  }).filter(d => d.total > 0).sort((a, b) => b.completed - a.completed);

  const totalWaiting = Object.values(queues).reduce((s, q) => s + q.filter(x => x.status === 'waiting').length, 0);
  const totalCompleted = Object.values(queues).reduce((s, q) => s + q.filter(x => x.status === 'completed').length, 0);

  return (
    <div className="analytics-page animate-fade-in">
      <header className="analytics-header">
        <h1><Activity size={26} /> Analytics Dashboard</h1>
        <p>Real-time hospital performance insights</p>
      </header>

      {/* KPI Row */}
      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-icon blue"><TrendingUp size={22} /></div>
          <div><p className="kpi-label">Total Revenue</p><h3 className="kpi-val">₹{totalRevenue.toLocaleString()}</h3></div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-icon green"><CheckCircle size={22} /></div>
          <div><p className="kpi-label">Completed Today</p><h3 className="kpi-val">{totalCompleted}</h3></div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-icon orange"><Clock size={22} /></div>
          <div><p className="kpi-label">Currently Waiting</p><h3 className="kpi-val">{totalWaiting}</h3></div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-icon purple"><Star size={22} /></div>
          <div><p className="kpi-label">Avg. Rating</p><h3 className="kpi-val">4.7 ⭐</h3></div>
        </Card>
      </div>

      {/* Tab Nav */}
      <div className="analytics-tabs">
        {[['flow','Patient Flow'],['revenue','Revenue'],['specialty','By Specialty'],['doctors','Doctor Performance']].map(([id, label]) => (
          <button key={id} className={`analytics-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* Charts */}
      {tab === 'flow' && (
        <Card className="animate-fade-in chart-card">
          <h3>Hourly Patient Flow</h3>
          <p className="text-muted mb-4">Simulated visits vs. completed consultations by hour</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={HOURLY_DATA}>
              <defs>
                <linearGradient id="gpat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gcomp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="patients" name="Patients Arrived" stroke="#2563eb" fill="url(#gpat)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#gcomp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === 'revenue' && (
        <div className="revenue-layout animate-fade-in">
          <Card className="chart-card">
            <h3>Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={revenuePieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ₹${value}`}>
                  {revenuePieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <div className="revenue-breakdown">
            <Card>
              <h4>Revenue Details</h4>
              {[{ label: 'Consultations', val: consultRevenue, color: COLORS[0] }, { label: 'Pharmacy', val: pharmRevenue, color: COLORS[1] }].map(r => (
                <div key={r.label} className="rev-detail-row">
                  <div className="rev-dot" style={{ background: r.color }}></div>
                  <div className="rev-det-info">
                    <strong>{r.label}</strong>
                    <span>₹{r.val.toLocaleString()}</span>
                  </div>
                  <span className="rev-pct">{Math.round(r.val/totalRevenue*100)}%</span>
                </div>
              ))}
              <div className="rev-total">Total: <strong>₹{totalRevenue.toLocaleString()}</strong></div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'specialty' && (
        <Card className="chart-card animate-fade-in">
          <h3>Demand by Specialization</h3>
          <p className="text-muted mb-4">Total visits across all branches (simulated)</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={SPECIALTY_DEMAND} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="visits" name="Total Visits" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === 'doctors' && (
        <Card className="chart-card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="perf-table">
            <thead>
              <tr>
                <th>Doctor</th><th>Specialization</th><th>Total</th>
                <th>Completed</th><th>Waiting</th><th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {doctorPerformance.length > 0 ? doctorPerformance.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td className="spec-tag">{d.specialization}</td>
                  <td>{d.total}</td>
                  <td className="text-success font-bold">{d.completed}</td>
                  <td className="text-warning font-bold">{d.waiting}</td>
                  <td>
                    {d.avgRating !== '—' ? (
                      <span className="rating-chip"><Star size={12} fill="currentColor" /> {d.avgRating}</span>
                    ) : '—'}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No active patient data yet. Book appointments to see data.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
