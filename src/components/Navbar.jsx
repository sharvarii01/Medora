import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Moon, Sun, Search as SearchIcon, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { Button } from './Button';
import { GlobalSearch } from './GlobalSearch';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <Activity className="brand-icon" size={28} />
            <span className="brand-text">MedoraQueue</span>
          </Link>
          
          <div className="navbar-links">
            {user && (
              <button className="theme-toggle" onClick={() => setSearchOpen(true)} aria-label="Search" title="Search (Ctrl+K)">
                <SearchIcon size={20} />
              </button>
            )}

            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <Link to="/queue" className="nav-link">Live Queue</Link>
            
            {user ? (
              <div className="navbar-user">
                <span className="user-info">
                  <strong>{user.name}</strong>
                  <span className="user-role badge">{user.role}</span>
                </span>
                <Button variant="outline" onClick={handleLogout} className="logout-btn">
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/">
                <Button variant="primary">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
};
