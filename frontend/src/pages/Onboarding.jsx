import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UploadCloud, CheckCircle2, ChevronRight, Briefcase, Code, LineChart, Megaphone, MonitorSmartphone, Target, Loader2 } from 'lucide-react';
import './Onboarding.css';

const ROLES = [
  { id: 'swe', name: 'Software Engineer', icon: Code },
  { id: 'ml', name: 'Machine Learning', icon: MonitorSmartphone },
  { id: 'data', name: 'Data Analyst', icon: LineChart },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'sales', name: 'Sales', icon: Target },
  { id: 'other', name: 'Other', icon: Briefcase },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Fetch current profile if they already have one (for Update Profile feature)
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`);
        const data = response.data;
        if (data.role) {
          const matchedRole = ROLES.find(r => r.name === data.role);
          if (matchedRole) {
            setSelectedRole(matchedRole);
          } else {
            // User previously entered a custom role
            setSelectedRole(ROLES.find(r => r.id === 'other'));
            setCustomRole(data.role);
          }
        }
        if (data.job_description) {
          setJobDescription(data.job_description);
        }
        if (data.resume_filepath) {
          const parts = data.resume_filepath.split('/');
          setExistingFileName(parts[parts.length - 1]);
        }
      } catch (err) {
        console.error("Failed to load existing profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      let finalRole = '';
      if (selectedRole) {
        finalRole = selectedRole.id === 'other' && customRole.trim() !== '' 
          ? customRole.trim() 
          : selectedRole.name;
        formData.append('role', finalRole);
      }
      if (jobDescription) formData.append('job_description', jobDescription);
      if (file) formData.append('resume', file);

      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local auth context
      updateProfile({
        role: finalRole,
        profileComplete: response.data.profileComplete
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to save profile:", err);
      const backendMsg = err.response?.data?.detail;
      const errorString = typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg);
      alert(`Failed to save profile: ${errorString || err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="onboard-container"><Loader2 className="spinner" size={48} /></div>;
  }

  return (
    <div className="onboard-container animate-fade-in">
      <div className="onboard-card glass-panel">
        <div className="onboard-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {step === 1 ? (
          <div className="step-content animate-fade-in">
            <h2 className="step-title">Profile Configuration</h2>
            <p className="step-subtitle">Tell us about the roles you are targeting.</p>
            
            <div className="role-grid">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <div 
                    key={role.id} 
                    className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <Icon className="role-icon" size={28} />
                    <span className="role-name">{role.name}</span>
                    {selectedRole?.id === role.id && <CheckCircle2 className="check-icon" size={20} />}
                  </div>
                );
              })}
            </div>

            {selectedRole?.id === 'other' && (
              <div className="custom-role-container animate-fade-in" style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Specify Your Preferred Role
                </label>
                <input 
                  type="text" 
                  className="glass-panel" 
                  placeholder="e.g. UX Designer, DevOps Engineer..." 
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  style={{ width: '100%', padding: '1rem', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            )}

            <div className="textarea-container" style={{ width: '100%', marginBottom: '2rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Target Job Description or Keywords (Optional)
              </label>
              <textarea 
                className="glass-panel"
                rows="4"
                placeholder="Paste an example job description or list specific skills you want the AI to match against..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ width: '100%', padding: '1rem', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', resize: 'vertical' }}
              />
            </div>

            <button 
              className="btn btn-primary step-next-btn"
              disabled={!selectedRole || (selectedRole.id === 'other' && !customRole.trim())}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="step-content animate-fade-in">
            <h2 className="step-title">Upload your Resume</h2>
            <p className="step-subtitle">Our AI reads your skills and maps them to perfect opportunities.</p>

            <div className="upload-area">
              <UploadCloud size={48} className="upload-icon" />
              <h3>Drag & Drop your resume here</h3>
              <p>Supports PDF, DOCX (Max 5MB)</p>
              
              <input 
                type="file" 
                id="resume-upload" 
                className="file-input" 
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="resume-upload" className="btn btn-secondary upload-btn">
                Browse Files
              </label>

              {/* Show locally selected file OR previously uploaded file */}
              {file ? (
                <div className="file-preview animate-fade-in">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>{file.name}</span>
                </div>
              ) : existingFileName ? (
                <div className="file-preview animate-fade-in" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
                  <CheckCircle2 size={16} />
                  <span>Current: {existingFileName}</span>
                </div>
              ) : null}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)} disabled={submitting}>Back</button>
              <button 
                className="btn btn-primary step-next-btn"
                disabled={(!file && !existingFileName) || submitting}
                onClick={handleComplete}
              >
                {submitting ? 'Saving...' : 'Complete Profile'} <CheckCircle2 size={18} style={{ marginLeft: "8px" }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
