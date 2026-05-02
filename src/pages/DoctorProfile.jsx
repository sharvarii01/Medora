import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Star, MapPin, Clock, Calendar, CheckCircle } from 'lucide-react';
import './DoctorProfile.css';

export const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, locations, ratings, bookedSlots, doctorAvailability } = useStore();
  
  const [activeTab, setActiveTab] = useState('about'); // about, reviews

  const doctor = doctors.find(d => d.id === id);
  if (!doctor) {
    return <div className="p-8 text-center text-muted">Doctor not found.</div>;
  }

  const location = locations.find(l => l.id === doctor.locationId);
  const docRatings = ratings[id] || [];
  const avgRating = docRatings.length ? (docRatings.reduce((s, r) => s + r.stars, 0) / docRatings.length).toFixed(1) : 0;
  const availability = doctorAvailability[id] || 'available';

  const upcomingSlots = bookedSlots.filter(s => s.doctorId === id);

  return (
    <div className="doc-profile-page animate-fade-in">
      {/* Header Profile Section */}
      <div className="doc-header-card">
        <div className="doc-avatar-large">
          {doctor.name.split(' ')[1]?.[0] || 'D'}
        </div>
        <div className="doc-header-info">
          <h1>{doctor.name}</h1>
          <p className="doc-spec-badge">{doctor.specialization}</p>
          <div className="doc-meta-row">
            <span><MapPin size={16} /> {location?.name}</span>
            <span className="doc-rating-stat"><Star size={16} fill="currentColor" /> {avgRating} ({docRatings.length} reviews)</span>
          </div>
          
          <div className="mt-4">
            {availability === 'available' && <span className="doc-status available">🟢 Accepting Patients</span>}
            {availability === 'break' && <span className="doc-status break">🟠 On Break</span>}
            {availability === 'offline' && <span className="doc-status offline">🔴 Offline</span>}
          </div>
        </div>
        <div className="doc-header-actions">
          <Button variant="primary" onClick={() => navigate('/patient/schedule')}>
            <Calendar size={18} /> Book Appointment
          </Button>
        </div>
      </div>

      <div className="doc-profile-grid">
        <div className="doc-main-content">
          <div className="doc-tabs">
            <button className={`doc-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About Doctor</button>
            <button className={`doc-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Patient Reviews ({docRatings.length})</button>
          </div>

          <Card className="doc-tab-content">
            {activeTab === 'about' && (
              <div className="animate-fade-in">
                <h3>Biography</h3>
                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                  {doctor.name} is a highly experienced {doctor.specialization} specialist practicing at {location?.name}. 
                  With over 12 years of clinical experience, they have established a reputation for compassionate patient care and excellent diagnostic skills.
                </p>
                <h3 className="mt-4">Experience & Credentials</h3>
                <ul className="doc-credentials-list text-muted">
                  <li><CheckCircle size={16} className="text-success" /> Board Certified in {doctor.specialization}</li>
                  <li><CheckCircle size={16} className="text-success" /> 12+ Years Clinical Experience</li>
                  <li><CheckCircle size={16} className="text-success" /> MD from Top Medical University</li>
                  <li><CheckCircle size={16} className="text-success" /> Member of National Medical Association</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                {docRatings.length === 0 ? (
                  <p className="text-muted">No reviews yet for this doctor.</p>
                ) : (
                  <div className="doc-reviews-list">
                    {docRatings.map(r => (
                      <div key={r.id} className="doc-review-item">
                        <div className="review-header flex-between">
                          <strong>{r.patientName}</strong>
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{r.date}</span>
                        </div>
                        <div className="review-stars">
                          {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.stars ? 'var(--warning)' : 'none'} color={s <= r.stars ? 'var(--warning)' : '#cbd5e1'} />)}
                        </div>
                        <p className="review-comment text-muted">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="doc-sidebar">
          <Card>
            <h3 style={{ marginTop: 0 }}><Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }}/> Visiting Hours</h3>
            <div className="doc-hours-list text-muted mt-4">
              <div className="flex-between py-2 border-b"><span>Mon - Fri</span><strong>9:00 AM - 5:00 PM</strong></div>
              <div className="flex-between py-2 border-b"><span>Saturday</span><strong>10:00 AM - 2:00 PM</strong></div>
              <div className="flex-between py-2 text-danger"><span>Sunday</span><strong>Closed</strong></div>
            </div>
          </Card>

          <Card className="mt-4">
            <h3 style={{ marginTop: 0 }}><Calendar size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }}/> Upcoming Bookings</h3>
            {upcomingSlots.length === 0 ? (
              <p className="text-muted mt-2">No upcoming scheduled appointments.</p>
            ) : (
              <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {upcomingSlots.slice(0, 4).map((s, i) => (
                  <div key={i} className="doc-slot-badge">
                    <span>{s.date}</span>
                    <strong>{s.time}</strong>
                  </div>
                ))}
                {upcomingSlots.length > 4 && <p className="text-muted text-center text-sm">+ {upcomingSlots.length - 4} more</p>}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
