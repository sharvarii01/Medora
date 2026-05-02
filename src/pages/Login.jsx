import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserCog, Stethoscope } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Login.css';

export const Login = () => {
  const login = useStore((state) => state.login);
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleLogin = (role) => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    login(role, name);
    
    // Redirect based on role
    if (role === 'patient') navigate('/patient');
    if (role === 'doctor') navigate('/doctor');
    if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-header">
        <h1>Welcome to Medora Health</h1>
        <p className="login-subtitle">An advanced multi-branch queue & appointment management system.</p>
      </div>

      <div className="login-grid">
        <div className="login-info-panel">
          <h2>Getting Started</h2>
          <p>Please select your role to enter the appropriate dashboard. Our system provides real-time tracking across all our branches.</p>
          
          <ul className="info-list">
            <li>
              <div className="info-icon bg-blue-light text-primary"><User size={20} /></div>
              <div>
                <strong>Patients</strong>
                <span>Select a branch, find your doctor, and join the live queue instantly.</span>
              </div>
            </li>
            <li>
              <div className="info-icon bg-green-light text-success"><Stethoscope size={20} /></div>
              <div>
                <strong>Doctors</strong>
                <span>Manage your daily appointments and update patient statuses in real-time.</span>
              </div>
            </li>
            <li>
              <div className="info-icon bg-orange-light text-warning"><UserCog size={20} /></div>
              <div>
                <strong>Administrators</strong>
                <span>Monitor workload, patient flow, and system analytics across all branches.</span>
              </div>
            </li>
          </ul>
        </div>

        <Card className="login-card">
          <h2 className="mb-4">Access Portal</h2>
          <div className="input-group">
            <label htmlFor="name">Your Full Name</label>
            <input 
              type="text" 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="med-input"
            />
          </div>

          <div className="role-selection">
            <label className="text-muted text-sm mb-2" style={{display: 'block'}}>Select your role to continue:</label>
            <Button 
              variant="outline" 
              className="role-btn patient-role-btn"
              onClick={() => handleLogin('patient')}
            >
              <User size={24} className="role-icon" />
              <span>Continue as Patient</span>
            </Button>

            <Button 
              variant="outline" 
              className="role-btn doctor-btn"
              onClick={() => handleLogin('doctor')}
            >
              <Stethoscope size={24} className="role-icon" />
              <span>Continue as Doctor</span>
            </Button>

            <Button 
              variant="outline" 
              className="role-btn admin-btn"
              onClick={() => handleLogin('admin')}
            >
              <UserCog size={24} className="role-icon" />
              <span>Continue as Admin</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
