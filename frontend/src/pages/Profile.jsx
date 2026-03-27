import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Briefcase, FileText, Edit, Loader2 } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`);
        setProfileData(response.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return <div className="profile-page-container"><Loader2 className="spinner" size={48} /></div>;
  }

  if (!profileData) {
    return <div className="profile-page-container">Failed to load profile data.</div>;
  }

  const getFileName = (filepath) => {
    if (!filepath) return "No resume uploaded";
    const parts = filepath.split('/');
    // Handle both Windows and Unix slashes implicitly if needed, or stick to literal
    const nameOnly = parts[parts.length - 1];
    return nameOnly.split('\\').pop(); 
  };

  const getFileUrl = (filepath) => {
    if (!filepath) return null;
    return `${import.meta.env.VITE_API_URL}/static/resumes/${getFileName(filepath)}`;
  };

  return (
    <div className="profile-page-container animate-fade-in">
      <div className="profile-header">
        <h1>Your <span className="text-gradient">Profile</span></h1>
        <p className="profile-subtitle">Manage your personal details and career preferences.</p>
      </div>

      <div className="profile-card glass-panel">
        <div className="profile-section">
          <div className="section-label"><User size={18} /> Full Name</div>
          <div className="section-value">{profileData.name || 'Not Provided'}</div>
        </div>

        <div className="profile-divider"></div>

        <div className="profile-section">
          <div className="section-label"><Mail size={18} /> Email Address</div>
          <div className="section-value">{profileData.email}</div>
        </div>

        <div className="profile-divider"></div>

        <div className="profile-section">
          <div className="section-label"><Briefcase size={18} /> Job Preference</div>
          <div className="section-value">
            <span className="role-badge">{profileData.role || 'Not Selected'}</span>
          </div>
        </div>

        <div className="profile-divider"></div>

        <div className="profile-section">
          <div className="section-label"><FileText size={18} /> Target Job Description</div>
          <div className="section-value max-lines">{profileData.job_description || 'None provided'}</div>
        </div>

        <div className="profile-divider"></div>

        <div className="profile-section">
          <div className="section-label"><FileText size={18} /> Uploaded Resume</div>
          <div className="section-value resume-file">
            {profileData.resume_filepath ? (
              <a href={getFileUrl(profileData.resume_filepath)} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>
                {getFileName(profileData.resume_filepath)}
              </a>
            ) : 'No resume uploaded'}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary edit-profile-btn" onClick={() => navigate('/onboarding')}>
            <Edit size={18} /> Edit Preferences & Resume
          </button>
        </div>
      </div>
    </div>
  );
}
