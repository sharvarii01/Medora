import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const MOCK_LOCATIONS = [
  { id: 'loc1', name: 'Medora Downtown' },
  { id: 'loc2', name: 'Medora Uptown' },
  { id: 'loc3', name: 'Medora West' }
];

// 12 specializations × 3 locations = 36 doctors
const MOCK_DOCTORS = [
  // ── Medora Downtown (loc1) ──
  { id: 'd_loc1_01', name: 'Dr. Sarah Smith',      specialization: 'Cardiology',        locationId: 'loc1' },
  { id: 'd_loc1_02', name: 'Dr. Emily Chen',        specialization: 'Pediatrics',        locationId: 'loc1' },
  { id: 'd_loc1_03', name: 'Dr. James Patel',       specialization: 'General Practice',  locationId: 'loc1' },
  { id: 'd_loc1_04', name: 'Dr. Priya Sharma',      specialization: 'Dermatology',       locationId: 'loc1' },
  { id: 'd_loc1_05', name: 'Dr. Robert Adams',      specialization: 'Neurology',         locationId: 'loc1' },
  { id: 'd_loc1_06', name: 'Dr. Linda Nguyen',      specialization: 'Orthopedics',       locationId: 'loc1' },
  { id: 'd_loc1_07', name: 'Dr. Karen Mitchell',    specialization: 'Gynecology',        locationId: 'loc1' },
  { id: 'd_loc1_08', name: 'Dr. Samuel Okafor',     specialization: 'ENT',               locationId: 'loc1' },
  { id: 'd_loc1_09', name: 'Dr. Nina Kapoor',       specialization: 'Ophthalmology',     locationId: 'loc1' },
  { id: 'd_loc1_10', name: 'Dr. David Liu',         specialization: 'Psychiatry',        locationId: 'loc1' },
  { id: 'd_loc1_11', name: 'Dr. Aisha Malik',       specialization: 'Gastroenterology',  locationId: 'loc1' },
  { id: 'd_loc1_12', name: 'Dr. Tom Brennan',       specialization: 'Pulmonology',       locationId: 'loc1' },

  // ── Medora Uptown (loc2) ──
  { id: 'd_loc2_01', name: 'Dr. John Doe',          specialization: 'Cardiology',        locationId: 'loc2' },
  { id: 'd_loc2_02', name: 'Dr. Anna Lee',          specialization: 'Pediatrics',        locationId: 'loc2' },
  { id: 'd_loc2_03', name: 'Dr. Mark Thompson',     specialization: 'General Practice',  locationId: 'loc2' },
  { id: 'd_loc2_04', name: 'Dr. Sofia Rivera',      specialization: 'Dermatology',       locationId: 'loc2' },
  { id: 'd_loc2_05', name: 'Dr. Victor Nwosu',      specialization: 'Neurology',         locationId: 'loc2' },
  { id: 'd_loc2_06', name: 'Dr. Rachel Kim',        specialization: 'Orthopedics',       locationId: 'loc2' },
  { id: 'd_loc2_07', name: 'Dr. Diane Foster',      specialization: 'Gynecology',        locationId: 'loc2' },
  { id: 'd_loc2_08', name: 'Dr. Hassan Al-Amin',    specialization: 'ENT',               locationId: 'loc2' },
  { id: 'd_loc2_09', name: 'Dr. Lily Zhang',        specialization: 'Ophthalmology',     locationId: 'loc2' },
  { id: 'd_loc2_10', name: 'Dr. Carlos Mendoza',    specialization: 'Psychiatry',        locationId: 'loc2' },
  { id: 'd_loc2_11', name: 'Dr. Pita Havili',       specialization: 'Gastroenterology',  locationId: 'loc2' },
  { id: 'd_loc2_12', name: 'Dr. Fiona Walsh',       specialization: 'Pulmonology',       locationId: 'loc2' },

  // ── Medora West (loc3) ──
  { id: 'd_loc3_01', name: 'Dr. Michael Brown',     specialization: 'Cardiology',        locationId: 'loc3' },
  { id: 'd_loc3_02', name: 'Dr. Grace Owusu',       specialization: 'Pediatrics',        locationId: 'loc3' },
  { id: 'd_loc3_03', name: 'Dr. Alan Singh',        specialization: 'General Practice',  locationId: 'loc3' },
  { id: 'd_loc3_04', name: 'Dr. Nadia Volkov',      specialization: 'Dermatology',       locationId: 'loc3' },
  { id: 'd_loc3_05', name: 'Dr. Kevin Park',        specialization: 'Neurology',         locationId: 'loc3' },
  { id: 'd_loc3_06', name: 'Dr. Helen Murray',      specialization: 'Orthopedics',       locationId: 'loc3' },
  { id: 'd_loc3_07', name: 'Dr. Tara Joshi',        specialization: 'Gynecology',        locationId: 'loc3' },
  { id: 'd_loc3_08', name: 'Dr. Ethan Clarke',      specialization: 'ENT',               locationId: 'loc3' },
  { id: 'd_loc3_09', name: 'Dr. Mei Lin Wong',      specialization: 'Ophthalmology',     locationId: 'loc3' },
  { id: 'd_loc3_10', name: 'Dr. Omar Abdullah',     specialization: 'Psychiatry',        locationId: 'loc3' },
  { id: 'd_loc3_11', name: 'Dr. Ravi Krishnan',     specialization: 'Gastroenterology',  locationId: 'loc3' },
  { id: 'd_loc3_12', name: 'Dr. Bridget O\'Neil',   specialization: 'Pulmonology',       locationId: 'loc3' },
];

// Helper: build an empty queue for every doctor
const buildInitialQueues = () => {
  const queues = {};
  MOCK_DOCTORS.forEach(d => { queues[d.id] = []; });
  // Seed a few sample patients for Downtown doctors to make the demo feel live
  queues['d_loc1_01'] = [
    { id: 'a1', patientName: 'Alice Brown',    token: 1, status: 'completed', doctorId: 'd_loc1_01' },
    { id: 'a2', patientName: 'Bob White',      token: 2, status: 'in-progress', doctorId: 'd_loc1_01' },
    { id: 'a3', patientName: 'Charlie Green',  token: 3, status: 'waiting', doctorId: 'd_loc1_01' },
  ];
  queues['d_loc1_02'] = [
    { id: 'b1', patientName: 'Diana Prince',   token: 1, status: 'waiting', doctorId: 'd_loc1_02' },
    { id: 'b2', patientName: 'Edward Norton',  token: 2, status: 'waiting', doctorId: 'd_loc1_02' },
  ];
  queues['d_loc2_01'] = [
    { id: 'c1', patientName: 'David Lee',      token: 1, status: 'waiting', doctorId: 'd_loc2_01' },
  ];
  return queues;
};

const AVG_CONSULTATION_TIME = 15; // minutes

// ── Mock Pharmacy Catalogue ──
const MOCK_MEDICINES = [
  { id: 'm1', name: 'Paracetamol 500mg', category: 'Painkiller', price: 45, unit: 'Strip of 10', inStock: true, img: '💊' },
  { id: 'm2', name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 120, unit: 'Strip of 10', inStock: true, img: '💊' },
  { id: 'm3', name: 'Omeprazole 20mg', category: 'Antacid', price: 85, unit: 'Strip of 14', inStock: true, img: '💊' },
  { id: 'm4', name: 'Metformin 500mg', category: 'Diabetes', price: 60, unit: 'Strip of 20', inStock: false, img: '💊' },
  { id: 'm5', name: 'Atorvastatin 10mg', category: 'Cholesterol', price: 150, unit: 'Strip of 10', inStock: true, img: '💊' },
  { id: 'm6', name: 'Vitamin D3 1000IU', category: 'Supplement', price: 220, unit: 'Bottle of 60', inStock: true, img: '🧴' },
  { id: 'm7', name: 'Cetirizine 10mg', category: 'Allergy', price: 35, unit: 'Strip of 10', inStock: true, img: '💊' },
  { id: 'm8', name: 'Ibuprofen 400mg', category: 'Painkiller', price: 55, unit: 'Strip of 10', inStock: true, img: '💊' },
  { id: 'm9', name: 'Amlodipine 5mg', category: 'Blood Pressure', price: 90, unit: 'Strip of 10', inStock: true, img: '💊' },
  { id: 'm10', name: 'Multivitamin Complex', category: 'Supplement', price: 340, unit: 'Bottle of 30', inStock: true, img: '🧴' },
];

// ── Mock Prescriptions ──
const MOCK_PRESCRIPTIONS = [
  {
    id: 'rx1', date: '2026-04-15', doctor: 'Dr. Sarah Smith', status: 'active',
    medicines: [
      { name: 'Amlodipine 5mg', dosage: '1 tablet daily', duration: '30 days' },
      { name: 'Atorvastatin 10mg', dosage: '1 tablet at night', duration: '30 days' },
    ],
    notes: 'Monitor blood pressure daily. Reduce salt intake.'
  },
  {
    id: 'rx2', date: '2026-02-10', doctor: 'Dr. John Doe', status: 'completed',
    medicines: [
      { name: 'Amoxicillin 250mg', dosage: '1 capsule thrice daily', duration: '7 days' },
      { name: 'Paracetamol 500mg', dosage: 'As needed for fever', duration: '7 days' },
    ],
    notes: 'Complete the full antibiotic course.'
  },
];

// ── Mock Payment History ──
const MOCK_PAYMENTS = [
  { id: 'pay1', date: '2026-04-15', type: 'Consultation', doctor: 'Dr. Sarah Smith', amount: 800, status: 'paid', invoice: 'INV-00123' },
  { id: 'pay2', date: '2026-04-15', type: 'Pharmacy', items: 'Amlodipine, Atorvastatin', amount: 240, status: 'paid', invoice: 'INV-00124' },
  { id: 'pay3', date: '2026-02-10', type: 'Consultation', doctor: 'Dr. John Doe', amount: 600, status: 'paid', invoice: 'INV-00098' },
  { id: 'pay4', date: '2026-02-10', type: 'Pharmacy', items: 'Amoxicillin, Paracetamol', amount: 165, status: 'paid', invoice: 'INV-00099' },
  { id: 'pay5', date: '2025-11-20', type: 'Consultation', doctor: 'Dr. Emily Chen', amount: 700, status: 'paid', invoice: 'INV-00065' },
];

// ── Mock Medical History ──
const MOCK_MEDICAL_HISTORY = [
  { id: 'mh1', date: '2026-04-15', doctor: 'Dr. Sarah Smith', specialization: 'Cardiology', diagnosis: 'Mild Hypertension', followUp: '2026-05-15', notes: 'BP: 140/90. Prescribed antihypertensives. Lifestyle modifications recommended.' },
  { id: 'mh2', date: '2026-02-10', doctor: 'Dr. John Doe', specialization: 'General Practice', diagnosis: 'Upper Respiratory Infection', followUp: 'N/A', notes: 'Throat infection. Antibiotics prescribed. Rest recommended for 3 days.' },
  { id: 'mh3', date: '2025-11-20', doctor: 'Dr. Emily Chen', specialization: 'Pediatrics', diagnosis: 'Seasonal Allergies', followUp: '2025-12-20', notes: 'Allergic rhinitis. Antihistamines prescribed. Avoid known allergens.' },
];

// ── Mock Lab Reports ──
const MOCK_LAB_REPORTS = [
  { id: 'lab1', date: '2026-04-15', name: 'Complete Blood Count (CBC)', type: 'Blood Test', status: 'ready', orderedBy: 'Dr. Sarah Smith', location: 'Medora Downtown' },
  { id: 'lab2', date: '2026-04-15', name: 'Lipid Profile', type: 'Blood Test', status: 'ready', orderedBy: 'Dr. Sarah Smith', location: 'Medora Downtown' },
  { id: 'lab3', date: '2026-02-10', name: 'Chest X-Ray', type: 'Radiology', status: 'ready', orderedBy: 'Dr. John Doe', location: 'Medora Uptown' },
  { id: 'lab4', date: '2026-02-10', name: 'Throat Culture', type: 'Microbiology', status: 'ready', orderedBy: 'Dr. John Doe', location: 'Medora Uptown' },
  { id: 'lab5', date: '2026-05-01', name: 'HbA1c Test', type: 'Blood Test', status: 'processing', orderedBy: 'Dr. Sarah Smith', location: 'Medora Downtown' },
  { id: 'lab6', date: '2026-05-02', name: '12-Lead ECG', type: 'Cardiology', status: 'pending', orderedBy: 'Dr. Sarah Smith', location: 'Medora Downtown' },
];

// ── Mock Doctor Ratings ──
const MOCK_RATINGS = {
  'd_loc1_01': [
    { id: 'r1', patientName: 'Alice B.', stars: 5, comment: 'Excellent doctor, very thorough.', date: '2026-04-15' },
    { id: 'r2', patientName: 'Charlie G.', stars: 4, comment: 'Professional and caring.', date: '2026-03-20' },
  ],
  'd_loc1_02': [
    { id: 'r3', patientName: 'Diana P.', stars: 5, comment: 'Great with children, very patient.', date: '2026-04-10' },
  ],
};

// ── Mock Booked Slots (for Appointment Scheduler) ──
const MOCK_BOOKED_SLOTS = [
  { doctorId: 'd_loc1_01', date: '2026-05-05', time: '10:00 AM' },
  { doctorId: 'd_loc1_01', date: '2026-05-05', time: '11:00 AM' },
  { doctorId: 'd_loc2_01', date: '2026-05-06', time: '9:00 AM' },
];

export const useStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),

      locations: MOCK_LOCATIONS,
      user: null,
      onboardingDone: false,
      setOnboardingDone: () => set({ onboardingDone: true }),

      doctors: MOCK_DOCTORS,
      medicines: MOCK_MEDICINES,
      prescriptions: MOCK_PRESCRIPTIONS,
      payments: MOCK_PAYMENTS,
      medicalHistory: MOCK_MEDICAL_HISTORY,
      labReports: MOCK_LAB_REPORTS,
      ratings: MOCK_RATINGS,
      bookedSlots: MOCK_BOOKED_SLOTS,
      auditLog: [],
      healthGoals: { height: 170, weight: 68, waterGlasses: 6, waterGoal: 8, steps: 4200, stepsGoal: 10000 },

      // Doctor availability per doctor id
      doctorAvailability: Object.fromEntries(MOCK_DOCTORS.map(d => [d.id, 'available'])),
      setDoctorAvailability: (doctorId, status) => set(state => ({
        doctorAvailability: { ...state.doctorAvailability, [doctorId]: status }
      })),

      // Cart state for pharmacy
      cart: [],
      addToCart: (medicine) => set(state => {
        const existing = state.cart.find(i => i.id === medicine.id);
        if (existing) { toast('Already in cart', { icon: '🛒' }); return state; }
        toast.success(`${medicine.name} added to cart`);
        return { cart: [...state.cart, { ...medicine, qty: 1 }] };
      }),
      removeFromCart: (id) => set(state => ({ cart: state.cart.filter(i => i.id !== id) })),
      updateCartQty: (id, qty) => set(state => ({
        cart: state.cart.map(i => i.id === id ? { ...i, qty } : i)
      })),
      checkout: () => set(state => {
        const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
        const newPayment = {
          id: `pay_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Pharmacy',
          items: state.cart.map(i => i.name).join(', '),
          amount: total, status: 'paid',
          invoice: `INV-${Math.floor(10000 + Math.random() * 90000)}`
        };
        const log = { id: `log_${Date.now()}`, time: new Date().toLocaleTimeString(), event: `Pharmacy order placed — ₹${total}`, type: 'payment' };
        toast.success(`Order placed! ₹${total} paid.`);
        return { cart: [], payments: [newPayment, ...state.payments], auditLog: [log, ...state.auditLog] };
      }),

      // Rating actions
      addRating: (doctorId, rating) => set(state => ({
        ratings: {
          ...state.ratings,
          [doctorId]: [rating, ...(state.ratings[doctorId] || [])]
        }
      })),

      // Booked slot actions
      bookSlot: (doctorId, date, time, patientName) => {
        set(state => {
          const log = { id: `log_${Date.now()}`, time: new Date().toLocaleTimeString(), event: `${patientName} booked slot with ${state.doctors.find(d => d.id === doctorId)?.name} on ${date} at ${time}`, type: 'booking' };
          return {
            bookedSlots: [...state.bookedSlots, { doctorId, date, time, patientName }],
            auditLog: [log, ...state.auditLog]
          };
        });
        toast.success(`Appointment confirmed for ${date} at ${time}`);
      },

      // Health goals
      updateHealthGoal: (key, value) => set(state => ({
        healthGoals: { ...state.healthGoals, [key]: value }
      })),

      // Prescriptions — doctor writes one
      addPrescription: (prescription) => set(state => ({
        prescriptions: [prescription, ...state.prescriptions]
      })),

      queues: buildInitialQueues(),

      // Auth Actions
      login: (role, name) => {
        set({ user: { role, name, id: `u_${Date.now()}` } });
        const log = { id: `log_${Date.now()}`, time: new Date().toLocaleTimeString(), event: `${name} logged in as ${role}`, type: 'auth' };
        set(state => ({ auditLog: [log, ...state.auditLog] }));
      },
      logout: () => set({ user: null, cart: [] }),

      // Patient Actions
      bookAppointment: (doctorId, patientName) => {
        let newApp;
        set((state) => {
          const doctorQueue = state.queues[doctorId] || [];
          const newToken = doctorQueue.length > 0
            ? Math.max(...doctorQueue.filter(q => typeof q.token === 'number').map(q => q.token), 0) + 1
            : 1;
          newApp = { id: `a_${Date.now()}`, patientName, token: newToken, status: 'waiting', doctorId };
          const log = { id: `log_${Date.now()}`, time: new Date().toLocaleTimeString(), event: `${patientName} joined queue for ${state.doctors.find(d => d.id === doctorId)?.name}`, type: 'queue' };
          return {
            queues: { ...state.queues, [doctorId]: [...doctorQueue, newApp] },
            auditLog: [log, ...state.auditLog]
          };
        });
        toast.success('Appointment booked successfully!');
        const state = get();
        const q = state.queues[doctorId];
        return q[q.length - 1];
      },

      // Doctor Actions
      updateAppointmentStatus: (doctorId, appointmentId, status) => {
        set((state) => {
          const doctorQueue = state.queues[doctorId] || [];
          const updatedQueue = doctorQueue.map(app =>
            app.id === appointmentId ? { ...app, status } : app
          );
          const app = doctorQueue.find(a => a.id === appointmentId);
          const log = { id: `log_${Date.now()}`, time: new Date().toLocaleTimeString(), event: `${app?.patientName}'s status changed to "${status}" by ${state.doctors.find(d => d.id === doctorId)?.name}`, type: 'queue' };
          return {
            queues: { ...state.queues, [doctorId]: updatedQueue },
            auditLog: [log, ...state.auditLog]
          };
        });
        if (status === 'completed') {
          toast.success('Patient marked as completed');
          // Trigger confetti
          import('canvas-confetti').then(m => m.default({ particleCount: 80, spread: 70, origin: { y: 0.6 } }));
        } else if (status === 'skipped') {
          toast('Patient skipped', { icon: '⏭️' });
        }
      },

      addEmergencyPatient: (doctorId, patientName) => {
        set((state) => {
          const doctorQueue = state.queues[doctorId] || [];
          const newAppointment = { id: `e_${Date.now()}`, patientName: `${patientName} (Emergency)`, token: 'EMG', status: 'waiting', isEmergency: true };
          const inProgressIndex = doctorQueue.findIndex(q => q.status === 'in-progress');
          const insertIndex = inProgressIndex >= 0 ? inProgressIndex + 1 : 0;
          const newQueue = [...doctorQueue];
          newQueue.splice(insertIndex, 0, newAppointment);
          const log = { id: `log_${Date.now()}`, time: new Date().toLocaleTimeString(), event: `Emergency patient "${patientName}" added by ${state.doctors.find(d => d.id === doctorId)?.name}`, type: 'emergency' };
          return {
            queues: { ...state.queues, [doctorId]: newQueue },
            auditLog: [log, ...state.auditLog]
          };
        });
        toast.error('Emergency patient added to queue!', { icon: '🚨' });
      },

      // Selectors/Helpers
      getEstimatedWaitTime: (doctorId, tokenOrId) => {
        const queue = get().queues[doctorId] || [];
        let waitingAhead = 0;
        for (const app of queue) {
          if (app.id === tokenOrId || app.token === tokenOrId) break;
          if (app.status === 'in-progress' || app.status === 'waiting') waitingAhead++;
        }
        return waitingAhead * AVG_CONSULTATION_TIME;
      },

      getSystemStats: () => {
        const state = get();
        let totalPatients = 0, completedPatients = 0;
        Object.values(state.queues).forEach(queue => {
          totalPatients += queue.length;
          completedPatients += queue.filter(q => q.status === 'completed').length;
        });
        return { totalPatients, completedPatients, avgWaitTime: AVG_CONSULTATION_TIME };
      },

      autoAdvanceQueue: () => {
        set((state) => {
          const newQueues = { ...state.queues };
          const doctorIds = Object.keys(newQueues);
          if (doctorIds.length === 0) return state;

          const randomDocId = doctorIds[Math.floor(Math.random() * doctorIds.length)];
          const queue = [...(newQueues[randomDocId] || [])];
          
          if (queue.length > 0) {
            const inProgressIdx = queue.findIndex(q => q.status === 'in-progress');
            if (inProgressIdx !== -1) {
              queue[inProgressIdx] = { ...queue[inProgressIdx], status: 'completed' };
              const nextIdx = queue.findIndex(q => q.status === 'waiting');
              if (nextIdx !== -1) {
                queue[nextIdx] = { ...queue[nextIdx], status: 'in-progress' };
              }
            } else {
              const nextIdx = queue.findIndex(q => q.status === 'waiting');
              if (nextIdx !== -1) {
                queue[nextIdx] = { ...queue[nextIdx], status: 'in-progress' };
              }
            }
          }
          newQueues[randomDocId] = queue;
          return { queues: newQueues };
        });
      }
    }),
    {
      name: 'medora-store',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        onboardingDone: state.onboardingDone,
        cart: state.cart,
        payments: state.payments,
        ratings: state.ratings,
        bookedSlots: state.bookedSlots,
        healthGoals: state.healthGoals,
        doctorAvailability: state.doctorAvailability,
        auditLog: state.auditLog.slice(0, 100), // keep last 100
      })
    }
  )
);

// Re-apply theme from storage on load
const storedTheme = useStore.getState().theme;
if (storedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');




