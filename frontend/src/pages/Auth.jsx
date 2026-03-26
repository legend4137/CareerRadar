import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (location.pathname === '/signup') setIsLogin(false);
    else setIsLogin(true);
  }, [location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("Email/Password login is not yet connected to the backend. Please use Google Auth for now.");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      // Send the Google JWT Token to our FastAPI Backend to verify and create session
      const response = await axios.post('http://localhost:8001/api/auth/google', {
        token: credential
      });

      const { access_token, user } = response.data;
      
      login(user, access_token);
      navigate(user.profileComplete ? '/dashboard' : '/onboarding');
      
    } catch (err) {
      console.error("Backend Auth Error:", err);
      setError("Failed to authenticate with the server. Did you set up the real Google Client ID in backend?");
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Log in to continue to your dashboard.' : 'Start discovering perfect opportunities today.'}
        </p>
        
        {error && <div style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login widget failed to load or authenticating user.")}
            useOneTap
            theme="filled_black"
            shape="rectangular"
          />
        </div>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="switch-link text-gradient" onClick={() => navigate(isLogin ? '/signup' : '/login')}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}
