import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (location.pathname === '/signup') setIsLogin(false);
    else setIsLogin(true);
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Login flow
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          email: email,
          password: password
        });
        const { access_token, user } = response.data;
        login(user, access_token);
        navigate('/dashboard');
      } else {
        // Signup flow
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
          name,
          email,
          password
        });
        const { access_token, user } = response.data;
        login(user, access_token);
        navigate('/onboarding');
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const backendMsg = err.response?.data?.detail;
      setError(backendMsg || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        token: credential
      });

      const { access_token, user } = response.data;
      
      login(user, access_token);
      navigate(user.profileComplete ? '/dashboard' : '/onboarding');
      
    } catch (err) {
      console.error("Backend Auth Error:", err);
      const backendMsg = err.response?.data?.detail;
      setError(backendMsg ? `Server rejected token: ${backendMsg}` : `Network Error: ${err.message}`);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Log in to continue to your dashboard.' : 'Start discovering perfect opportunities today.'}
        </p>
        
        {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@university.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed.")}
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
