import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { PatientDashboard } from './pages/PatientDashboard';
import { PatientProfile } from './pages/PatientProfile';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { LiveQueue } from './pages/LiveQueue';
import { AppointmentScheduler } from './pages/AppointmentScheduler';
import { LabReports } from './pages/LabReports';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { DoctorProfile } from './pages/DoctorProfile';
import { OnboardingTour } from './components/OnboardingTour';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = useStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" />
        <OnboardingTour />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/queue" element={<LiveQueue />} />
            
            <Route 
              path="/patient" 
              element={
                <ProtectedRoute allowedRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patient/profile" 
              element={
                <ProtectedRoute allowedRole="patient">
                  <PatientProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patient/schedule" 
              element={
                <ProtectedRoute allowedRole="patient">
                  <AppointmentScheduler />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/patient/labs" 
              element={
                <ProtectedRoute allowedRole="patient">
                  <LabReports />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/doctor/:id/profile" 
              element={
                <ProtectedRoute allowedRole="patient">
                  <DoctorProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute allowedRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
