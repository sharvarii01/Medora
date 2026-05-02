import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  LayoutDashboard, FileText, Pill, ShoppingCart, CreditCard,
  Calendar, Heart, Activity, Thermometer, Droplets,
  CheckCircle, Clock, AlertCircle, Search, Trash2,
  Plus, Minus, Download, ChevronRight, Star, X, MessageSquare, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import './PatientProfile.css';

// ─── Tab IDs ───
const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'history', label: 'Medical History', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'pharmacy', label: 'Pharmacy', icon: ShoppingCart },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

// ─── Vitals mock ───
const VITALS = [
  { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'red', trend: '↓ Normal' },
  { label: 'Blood Pressure', value: '122/82', unit: 'mmHg', icon: Activity, color: 'blue', trend: '↑ Slightly high' },
  { label: 'Temperature', value: '36.8', unit: '°C', icon: Thermometer, color: 'orange', trend: '✓ Normal' },
  { label: 'Blood Glucose', value: '98', unit: 'mg/dL', icon: Droplets, color: 'green', trend: '✓ Normal' },
];

const MEDICINE_CATEGORIES = ['All', 'Painkiller', 'Antibiotic', 'Antacid', 'Diabetes', 'Cholesterol', 'Supplement', 'Allergy', 'Blood Pressure'];

export const PatientProfile = () => {
  const {
    user, medicalHistory, prescriptions, payments, medicines, doctors,
    cart, addToCart, removeFromCart, updateCartQty, checkout,
    healthGoals, setHealthGoal, addDoctorRating, ratings
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [pharmSearch, setPharmSearch] = useState('');
  const [pharmCategory, setPharmCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingDoc, setRatingDoc] = useState(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([{ sender: 'bot', text: 'Hi! I am Medora AI. How can I help you today?' }]);
  const [chatInput, setChatInput] = useState('');

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const filteredMeds = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(pharmSearch.toLowerCase());
    const matchCat = pharmCategory === 'All' || m.category === pharmCategory;
    return matchSearch && matchCat;
  });

  const totalSpent = payments.reduce((s, p) => s + p.amount, 0);

  const handleRatingSubmit = () => {
    if (ratingStars > 0 && ratingDoc) {
      addDoctorRating(ratingDoc.id, { stars: ratingStars, comment: ratingComment, patientName: user?.name, date: new Date().toISOString().split('T')[0] });
      toast.success('Thank you for your feedback!');
      setRatingModalOpen(false);
      setRatingDoc(null);
      setRatingStars(0);
      setRatingComment('');
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const newMsg = { sender: 'user', text: userText };
    setChatMsgs([...chatMsgs, newMsg]);
    setChatInput('');
    
    setTimeout(() => {
      let botResponse = "I'm your Medora virtual assistant. I've noted your symptoms. Please consult your doctor for a professional diagnosis.";
      const lower = userText.toLowerCase();
      
      if (lower.includes('cold') || lower.includes('cough') || lower.includes('fever')) {
        botResponse = "It sounds like you might have a viral infection. Please get plenty of rest, stay hydrated, and you might want to ask your doctor about a mild fever reducer. Do you need me to help you book an appointment with a General Practitioner?";
      } else if (lower.includes('headache') || lower.includes('pain')) {
        botResponse = "If you're experiencing severe or persistent pain, I highly recommend scheduling a consultation. I can see you have some painkillers in the pharmacy tab, but a doctor should evaluate the cause.";
      } else if (lower.includes('appointment') || lower.includes('book')) {
        botResponse = "You can easily book an appointment by clicking on the 'Book Appointment' button in your dashboard, or I can redirect you there. What specialization are you looking for?";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        botResponse = `Hello there, ${user?.name}! How are you feeling today?`;
      }
      
      setChatMsgs(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 800);
  };

  const myGoals = healthGoals[user?.id] || [
    { id: 'g1', title: 'Daily Steps', target: 10000, current: 7500, unit: 'steps' },
    { id: 'g2', title: 'Water Intake', target: 8, current: 5, unit: 'glasses' }
  ];

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-hero">
        <div className="profile-hero-left">
          <div className="profile-avatar">{user?.name?.[0] || 'P'}</div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p>Patient ID: MED-{Math.abs(user?.id?.slice(-4) || '0001')}</p>
            <div className="profile-badges">
              <span className="pbadge pbadge-blue">Blood: B+</span>
              <span className="pbadge pbadge-green">Allergies: None</span>
              <span className="pbadge pbadge-orange">Age: 32</span>
            </div>
          </div>
        </div>
        <div className="profile-hero-right">
          <div className="hero-stat">
            <div className="hero-stat-num">{medicalHistory.length}</div>
            <div className="hero-stat-label">Visits</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">{prescriptions.filter(p => p.status === 'active').length}</div>
            <div className="hero-stat-label">Active Rx</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">₹{totalSpent.toLocaleString()}</div>
            <div className="hero-stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
        <button className="profile-tab cart-tab" onClick={() => setShowCart(true)}>
          <ShoppingCart size={18} /> Cart
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="section-heading">Health Overview</h2>
            <div className="vitals-grid">
              {VITALS.map(v => {
                const Icon = v.icon;
                return (
                  <Card key={v.label} className={`vital-card vital-${v.color}`}>
                    <div className="vital-icon-wrap"><Icon size={22} /></div>
                    <div className="vital-data">
                      <div className="vital-value">{v.value} <span className="vital-unit">{v.unit}</span></div>
                      <div className="vital-label">{v.label}</div>
                      <div className="vital-trend">{v.trend}</div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="overview-grid">
              <Card>
                <div className="card-sec-header">
                  <h3>Recent Visits</h3>
                  <button className="link-btn" onClick={() => setActiveTab('history')}>View all →</button>
                </div>
                {medicalHistory.slice(0, 2).map(h => (
                  <div key={h.id} className="mini-record">
                    <div className="mini-record-date">{h.date}</div>
                    <div className="mini-record-main">
                      <strong>{h.diagnosis}</strong>
                      <span>{h.doctor}</span>
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <div className="card-sec-header">
                  <h3>Active Prescriptions</h3>
                  <button className="link-btn" onClick={() => setActiveTab('prescriptions')}>View all →</button>
                </div>
                {prescriptions.filter(p => p.status === 'active').map(rx => (
                  <div key={rx.id} className="mini-record">
                    <div className="mini-record-date">{rx.date}</div>
                    <div className="mini-record-main">
                      <strong>{rx.medicines.map(m => m.name).join(', ')}</strong>
                      <span>{rx.doctor}</span>
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <div className="card-sec-header">
                  <h3><Target size={18} style={{display:'inline', verticalAlign:'middle'}}/> Health Goals</h3>
                </div>
                {myGoals.map(g => (
                  <div key={g.id} style={{ marginBottom: '1rem' }}>
                    <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <strong>{g.title}</strong>
                      <span>{g.current} / {g.target} {g.unit}</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--success)', width: `${Math.min(100, (g.current/g.target)*100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <h3 className="mb-4">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="qa-btn" onClick={() => setActiveTab('pharmacy')}><Pill size={20} /> Order Medicines</button>
                  <button className="qa-btn" onClick={() => setActiveTab('prescriptions')}><FileText size={20} /> View Rx</button>
                  <button className="qa-btn" onClick={() => setActiveTab('payments')}><CreditCard size={20} /> Bills & Payments</button>
                  <button className="qa-btn" onClick={() => setActiveTab('history')}><Activity size={20} /> Medical Records</button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <h2 className="section-heading">Medical History</h2>
            <div className="history-timeline">
              {medicalHistory.map((h, i) => {
                const doc = doctors.find(d => d.name === h.doctor);
                return (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    {i < medicalHistory.length - 1 && <div className="timeline-line"></div>}
                    <Card className="timeline-card">
                      <div className="timeline-header">
                        <div>
                          <h3 className="diagnosis-title">{h.diagnosis}</h3>
                          <p className="timeline-meta">{h.doctor} · {h.specialization}</p>
                        </div>
                        <div className="timeline-date-badge">{h.date}</div>
                      </div>
                      <p className="timeline-notes">{h.notes}</p>
                      <div className="timeline-footer flex-between">
                        <span className="follow-up-tag"><Calendar size={13} /> Follow-up: {h.followUp}</span>
                        {doc && (
                          <button className="link-btn" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => { setRatingDoc(doc); setRatingModalOpen(true); }}>
                            <Star size={13} /> Rate Doctor
                          </button>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="animate-fade-in">
            <h2 className="section-heading">Prescriptions</h2>
            <div className="rx-grid">
              {prescriptions.map(rx => (
                <Card key={rx.id} className={`rx-card ${rx.status === 'active' ? 'rx-active' : ''}`}>
                  <div className="rx-header">
                    <div>
                      <h3>{rx.doctor}</h3>
                      <span className="rx-date"><Calendar size={13} /> {rx.date}</span>
                    </div>
                    <span className={`rx-status-badge ${rx.status}`}>
                      {rx.status === 'active' ? <><CheckCircle size={14} /> Active</> : <><Clock size={14} /> Completed</>}
                    </span>
                  </div>
                  <table className="rx-table">
                    <thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th></tr></thead>
                    <tbody>
                      {rx.medicines.map((m, i) => (
                        <tr key={i}><td><Pill size={13} className="inline-icon" /> {m.name}</td><td>{m.dosage}</td><td>{m.duration}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="rx-notes"><AlertCircle size={14} /> <em>{rx.notes}</em></div>
                  <div className="rx-actions">
                    <Button variant="secondary" className="rx-btn"><Download size={14} /> Download PDF</Button>
                    {rx.status === 'active' && <Button variant="primary" className="rx-btn" onClick={() => setActiveTab('pharmacy')}><ShoppingCart size={14} /> Order Medicines</Button>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pharmacy' && (
          <div className="animate-fade-in">
            <div className="pharmacy-header">
              <h2 className="section-heading">Online Pharmacy</h2>
              <Button variant="primary" onClick={() => setShowCart(true)}>
                <ShoppingCart size={16} /> Cart ({cartCount}) — ₹{cartTotal}
              </Button>
            </div>
            <div className="pharm-controls">
              <div className="search-bar pharm-search">
                <Search size={18} className="search-icon" />
                <input type="text" className="med-input search-input" placeholder="Search medicines..." value={pharmSearch} onChange={e => setPharmSearch(e.target.value)} />
              </div>
              <div className="category-chips">
                {MEDICINE_CATEGORIES.map(cat => <button key={cat} className={`cat-chip ${pharmCategory === cat ? 'active' : ''}`} onClick={() => setPharmCategory(cat)}>{cat}</button>)}
              </div>
            </div>
            <div className="medicine-grid">
              {filteredMeds.map(m => {
                const inCart = cart.find(c => c.id === m.id);
                return (
                  <Card key={m.id} className={`medicine-card ${!m.inStock ? 'out-of-stock' : ''}`}>
                    <div className="med-emoji">{m.img}</div><div className="med-cat-tag">{m.category}</div>
                    <h4 className="med-name">{m.name}</h4><p className="med-unit">{m.unit}</p>
                    <div className="med-footer">
                      <span className="med-price">₹{m.price}</span>
                      {m.inStock ? (
                        <button className={`add-to-cart-btn ${inCart ? 'in-cart' : ''}`} onClick={() => addToCart(m)}>{inCart ? <><CheckCircle size={14} /> Added</> : <><Plus size={14} /> Add</>}</button>
                      ) : <span className="out-badge">Out of Stock</span>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="animate-fade-in">
            <h2 className="section-heading">Payment History</h2>
            <div className="pay-summary-grid">
              <Card className="pay-sum-card"><div className="pay-sum-icon blue"><CreditCard size={24} /></div><div><p className="pay-sum-label">Total Spent</p><h3 className="pay-sum-val">₹{totalSpent.toLocaleString()}</h3></div></Card>
              <Card className="pay-sum-card"><div className="pay-sum-icon green"><CheckCircle size={24} /></div><div><p className="pay-sum-label">Transactions</p><h3 className="pay-sum-val">{payments.length}</h3></div></Card>
              <Card className="pay-sum-card"><div className="pay-sum-icon orange"><Pill size={24} /></div><div><p className="pay-sum-label">Pharmacy Spend</p><h3 className="pay-sum-val">₹{payments.filter(p => p.type === 'Pharmacy').reduce((s, p) => s + p.amount, 0).toLocaleString()}</h3></div></Card>
            </div>
            <Card className="pay-table-card">
              <table className="payments-table">
                <thead><tr><th>Invoice</th><th>Date</th><th>Type</th><th>Details</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="invoice-id">{p.invoice}</td><td>{p.date}</td>
                      <td><span className={`type-badge type-${p.type.toLowerCase()}`}>{p.type}</span></td>
                      <td className="pay-details">{p.doctor || p.items || '—'}</td><td className="pay-amount">₹{p.amount}</td>
                      <td><span className="pay-badge paid"><CheckCircle size={12} /> Paid</span></td>
                      <td><button className="download-btn"><Download size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>

      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3><ShoppingCart size={20} /> My Cart ({cartCount})</h3>
              <button className="cart-close" onClick={() => setShowCart(false)}><X size={20} /></button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={48} className="text-muted" /><p>Your cart is empty</p>
                <Button variant="primary" onClick={() => { setShowCart(false); setActiveTab('pharmacy'); }}>Browse Pharmacy</Button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <span className="cart-item-emoji">{item.img}</span>
                      <div className="cart-item-info"><strong>{item.name}</strong><span className="text-muted">{item.unit}</span></div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => item.qty > 1 ? updateCartQty(item.id, item.qty - 1) : removeFromCart(item.id)}><Minus size={14} /></button>
                        <span>{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateCartQty(item.id, item.qty + 1)}><Plus size={14} /></button>
                      </div>
                      <div className="cart-item-price">₹{item.price * item.qty}</div>
                      <button className="cart-remove" onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total"><span>Total</span><strong>₹{cartTotal}</strong></div>
                  <Button variant="success" className="w-100" onClick={() => { checkout(); setShowCart(false); }}><CheckCircle size={16} /> Place Order — ₹{cartTotal}</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title={`Rate ${ratingDoc?.name}`}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p className="text-muted mb-4">How was your experience with the doctor?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRatingStars(s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Star size={32} fill={s <= ratingStars ? 'var(--warning)' : 'none'} color={s <= ratingStars ? 'var(--warning)' : '#cbd5e1'} />
              </button>
            ))}
          </div>
        </div>
        <textarea className="med-input w-100 mb-4" rows="3" placeholder="Leave a comment (optional)..." value={ratingComment} onChange={e => setRatingComment(e.target.value)}></textarea>
        <div className="flex-end"><Button variant="primary" onClick={handleRatingSubmit} disabled={ratingStars === 0}>Submit Rating</Button></div>
      </Modal>

      {/* AI Chatbot Widget */}
      <div className={`chatbot-widget ${chatOpen ? 'open' : ''}`}>
        {!chatOpen ? (
          <button className="chatbot-toggle" onClick={() => setChatOpen(true)}>
            <MessageSquare size={24} />
          </button>
        ) : (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div><strong>Medora AI</strong><span style={{ fontSize: '0.75rem', display: 'block', opacity: 0.8 }}>Online</span></div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="chatbot-body">
              {chatMsgs.map((m, i) => (
                <div key={i} className={`chat-msg ${m.sender}`}><span>{m.text}</span></div>
              ))}
            </div>
            <div className="chatbot-footer">
              <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') handleChatSend()}} placeholder="Ask something..." />
              <button onClick={handleChatSend}><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
