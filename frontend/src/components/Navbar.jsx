import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Edit } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleUpdateProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const isAuthPage = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  // Get user's display name or fallback
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon"></div>
          <span className="logo-text text-primary">Opportunity<span className="text-gradient">Radar</span></span>
        </Link>
        
        {/* Do NOT render regular nav links if user is authenticated OR if on auth page */}
        {!user && !isAuthPage && (
          <nav className="navbar-links">
            <a href="#problem" className="nav-link">The Problem</a>
            <a href="#solution" className="nav-link">Our Solution</a>
            <a href="#features" className="nav-link">Features</a>
          </nav>
        )}

        {/* Render authenticated nav links */}
        {user && user.profileComplete && (
          <nav className="navbar-links">
            <Link to="/dashboard" className="nav-link" style={{ fontWeight: 600 }}>Dashboard</Link>
          </nav>
        )}
        
        <div className="navbar-actions">
          {user ? (
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <button 
                className="btn btn-secondary nav-btn profile-trigger" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div className="profile-avatar">
                     {userInitial}
                   </div>
                   <span className="hide-on-mobile" style={{ marginRight: '8px' }}>{displayName}</span>
                </div>
              </button>
              
              {dropdownOpen && (
                <div className="profile-dropdown-menu animate-fade-in" style={{ animationDuration: '0.2s' }}>
                  <button className="dropdown-item" onClick={handleUpdateProfile}>
                    <Edit size={16} /> Update Profile
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isAuthPage && (
              <>
                <Link to="/login" className="btn btn-secondary nav-btn" style={{ textDecoration: 'none' }}>Log in</Link>
                <Link to="/signup" className="btn btn-primary nav-btn" style={{ textDecoration: 'none' }}>Sign up</Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
