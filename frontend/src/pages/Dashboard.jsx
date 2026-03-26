import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Calendar, Star } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, <span className="text-gradient">{user?.name}</span> 👋</h1>
        <p className="dashboard-subtitle">Here are the best {user?.role || 'SWE'} opportunities matching your resume.</p>
      </div>

      <div className="dashboard-content">
        <div className="opportunities-list">
          <div className="glass-panel text-center" style={{ padding: '3rem', marginTop: '2rem' }}>
            <Briefcase size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
            <h2>Your AI Radar is processing...</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              We're analyzing your resume and scanning for the perfect matches. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
