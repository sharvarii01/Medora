import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MapPin, Clock, ChevronLeft, ChevronRight, Check, Calendar, User } from 'lucide-react';
import './AppointmentScheduler.css';

const TIME_SLOTS = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < first; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export const AppointmentScheduler = () => {
  const { doctors, locations, bookedSlots, bookSlot, user } = useStore();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id);
  const [step, setStep] = useState(1); // 1=pick date 2=pick time 3=confirm 4=done

  const calDays = getCalendarDays(viewYear, viewMonth);
  const locationDoctors = doctors.filter(d => d.locationId === selectedLocation);

  const formatDate = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const isSlotBooked = (time) => {
    if (!selectedDate || !selectedDoctor) return false;
    return bookedSlots.some(s => s.doctorId === selectedDoctor && s.date === selectedDate && s.time === time);
  };

  const isPast = (day) => {
    if (!day) return false;
    return new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleDateClick = (day) => {
    if (!day || isPast(day)) return;
    setSelectedDate(formatDate(viewYear, viewMonth, day));
    setSelectedTime(null);
    setStep(2);
  };

  const handleConfirm = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    bookSlot(selectedDoctor, selectedDate, selectedTime, user?.name || 'Patient');
    setStep(4);
  };

  const resetAll = () => {
    setSelectedDate(null); setSelectedTime(null);
    setSelectedDoctor(''); setStep(1);
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  return (
    <div className="scheduler-page animate-fade-in">
      <header className="scheduler-header">
        <h1><Calendar size={28} /> Appointment Scheduler</h1>
        <p>Book a future appointment slot with your preferred doctor</p>
      </header>

      {/* Step indicator */}
      <div className="sched-steps">
        {['Select Date','Choose Time','Confirm'].map((s, i) => (
          <div key={s} className={`sched-step ${step > i+1 ? 'done' : step === i+1 ? 'active' : ''}`}>
            <div className="sched-step-dot">{step > i+1 ? <Check size={14} /> : i+1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="scheduler-layout">
        {/* Left: Controls */}
        <div className="sched-controls">
          <Card>
            <h3>Branch & Doctor</h3>
            <div className="form-group mt-2">
              <label>Branch</label>
              <select className="med-select" value={selectedLocation} onChange={e => { setSelectedLocation(e.target.value); setSelectedDoctor(''); }}>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Doctor</label>
              <select className="med-select" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                <option value="">— Select Doctor —</option>
                {locationDoctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} · {d.specialization}</option>
                ))}
              </select>
            </div>
          </Card>

          {selectedDate && (
            <Card className="mt-4 sched-selection-card animate-fade-in">
              <h4>Selected</h4>
              <div className="sched-sel-row"><Calendar size={16} /> {selectedDate}</div>
              {selectedTime && <div className="sched-sel-row"><Clock size={16} /> {selectedTime}</div>}
              {selectedDoctor && <div className="sched-sel-row"><User size={16} /> {doctors.find(d => d.id === selectedDoctor)?.name}</div>}
            </Card>
          )}
        </div>

        {/* Right: Calendar or Time slots */}
        <div className="sched-main">
          {step <= 1 && (
            <Card>
              <div className="cal-header">
                <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
                <h3>{MONTHS[viewMonth]} {viewYear}</h3>
                <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
              </div>
              <div className="cal-grid">
                {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
                {calDays.map((day, i) => (
                  <div
                    key={i}
                    className={`cal-day ${!day ? 'empty' : ''} ${isPast(day) ? 'past' : ''} ${day && selectedDate === formatDate(viewYear, viewMonth, day) ? 'selected' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="animate-fade-in">
              <div className="flex-between mb-4">
                <h3>Available Slots — {selectedDate}</h3>
                <button className="link-btn" onClick={() => setStep(1)}>← Change Date</button>
              </div>
              {!selectedDoctor ? (
                <p className="text-muted">Please select a doctor first.</p>
              ) : (
                <div className="time-slots-grid">
                  {TIME_SLOTS.map(time => {
                    const booked = isSlotBooked(time);
                    return (
                      <button
                        key={time}
                        className={`time-slot ${booked ? 'booked' : ''} ${selectedTime === time ? 'selected' : ''}`}
                        disabled={booked}
                        onClick={() => { setSelectedTime(time); setStep(3); }}
                      >
                        {booked ? '🔒' : <Clock size={14} />} {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {step === 3 && (
            <Card className="animate-fade-in confirm-card">
              <h3>Confirm Appointment</h3>
              <div className="confirm-details">
                <div className="confirm-row"><span>Doctor</span><strong>{doctors.find(d => d.id === selectedDoctor)?.name}</strong></div>
                <div className="confirm-row"><span>Specialization</span><strong>{doctors.find(d => d.id === selectedDoctor)?.specialization}</strong></div>
                <div className="confirm-row"><span>Branch</span><strong>{locations.find(l => l.id === selectedLocation)?.name}</strong></div>
                <div className="confirm-row"><span>Date</span><strong>{selectedDate}</strong></div>
                <div className="confirm-row"><span>Time</span><strong>{selectedTime}</strong></div>
                <div className="confirm-row"><span>Patient</span><strong>{user?.name}</strong></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button variant="success" onClick={handleConfirm}><Check size={16} /> Confirm Booking</Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="animate-fade-in success-card">
              <div className="success-icon">✅</div>
              <h2>Appointment Confirmed!</h2>
              <p className="text-muted">Your slot has been booked successfully.</p>
              <div className="confirm-details mt-4">
                <div className="confirm-row"><span>Doctor</span><strong>{doctors.find(d => d.id === selectedDoctor)?.name}</strong></div>
                <div className="confirm-row"><span>Date</span><strong>{selectedDate}</strong></div>
                <div className="confirm-row"><span>Time</span><strong>{selectedTime}</strong></div>
              </div>
              <Button variant="primary" className="mt-4" onClick={resetAll}>Book Another</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
