import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UploadCloud, CheckCircle2, ChevronRight, Briefcase, Code, LineChart, Megaphone, MonitorSmartphone, Target, Loader2, MapPin, Search, Plus } from 'lucide-react';
import './Onboarding.css';

const ROLES = [
  { id: 'swe', name: 'Software Engineer', icon: Code },
  { id: 'consultant', name: 'Consultant', icon: Briefcase },
  { id: 'ml', name: 'Machine Learning', icon: MonitorSmartphone },
  { id: 'data', name: 'Data Analyst', icon: LineChart },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'sales', name: 'Sales', icon: Target },
  { id: 'other', name: 'Other', icon: Briefcase },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [customRole, setCustomRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Step 1: Resume
  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  
  // Step 2: Job Preferences
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [customRole, setCustomRole] = useState('');
  
  // Step 3: Location Preferences
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [customLocation, setCustomLocation] = useState('');
  
  // Step 4: Intro
  const [whyHireMe, setWhyHireMe] = useState('');
  
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

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
        
        if (data.preferences) {
          setSelectedRoles(data.preferences.job_roles || []);
          setSelectedLocations(data.preferences.locations || []);
          setWhyHireMe(data.preferences.why_hire_me || '');
        }
      } catch (err) {
        console.error("Failed to load existing profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const toggleRole = (roleName) => {
    setSelectedRoles(prev => 
      prev.includes(roleName) 
        ? prev.filter(r => r !== roleName) 
        : [...prev, roleName]
    );
  };

  const addCustomRole = () => {
    if (customRole.trim() && !selectedRoles.includes(customRole.trim())) {
      setSelectedRoles(prev => [...prev, customRole.trim()]);
      setCustomRole('');
    }
  };

  const toggleLocation = (locName) => {
    setSelectedLocations(prev => 
      prev.includes(locName) 
        ? prev.filter(l => l !== locName) 
        : [...prev, locName]
    );
  };

  const addCustomLocation = () => {
    if (customLocation.trim() && !selectedLocations.includes(customLocation.trim())) {
      setSelectedLocations(prev => [...prev, customLocation.trim()]);
      setCustomLocation('');
    }
  };

  const handleResumeUpload = async () => {
    if (!file) {
      setStep(2);
      return;
    }
    
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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setStep(2);
    } catch (err) {
      console.error("Resume upload failed:", err);
      alert("Failed to upload resume. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Save preferences
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/preferences`, {
        job_roles: selectedRoles,
        locations: selectedLocations,
        why_hire_me: whyHireMe
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update local auth context (optional, depends on how much you want to sync)
      updateProfile({ profileComplete: true });
      
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to save preferences:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="onboard-container"><Loader2 className="spinner" size={48} /></div>;
  }

  const renderStepProgress = () => (
    <div className="onboard-progress">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div className={`progress-step ${step >= s ? 'active' : ''}`}>{s}</div>
          {s < 4 && <div className={`progress-line ${step > s ? 'active' : ''}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

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

            <button 
              className="btn btn-primary step-next-btn"
              disabled={submitting}
              onClick={handleResumeUpload}
            >
              {submitting ? 'Uploading...' : 'Continue'} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h2 className="step-title">Job Preferences</h2>
            <p className="step-subtitle">Select the roles you are most interested in pursuing.</p>
            
            <div className="role-grid">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRoles.includes(role.name);
                return (
                  <div 
                    key={role.id} 
                    className={`role-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleRole(role.name)}
                  >
                    <Icon className="role-icon" size={28} />
                    <span className="role-name">{role.name}</span>
                    {isSelected && <CheckCircle2 className="check-icon" size={20} />}
                  </div>
                );
              })}
            </div>

            <div className="custom-input-group">
              <input 
                type="text" 
                placeholder="Other role (e.g. Product Manager)" 
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
              />
              <button onClick={addCustomRole} className="btn-icon"><Plus size={20} /></button>
            </div>

            <div className="selected-chips">
              {selectedRoles.filter(r => !ROLES.some(role => role.name === r)).map(r => (
                <span key={r} className="chip" onClick={() => toggleRole(r)}>
                  {r} <span className="chip-remove">×</span>
                </span>
              ))}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn btn-primary step-next-btn"
                disabled={selectedRoles.length === 0}
                onClick={() => setStep(3)}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-fade-in">
            <h2 className="step-title">Location Preferences</h2>
            <p className="step-subtitle">Where would you like to work? You can choose multiple.</p>
            
            <div className="location-grid">
              {LOCATIONS.map((loc) => {
                const isSelected = selectedLocations.includes(loc.name);
                return (
                  <div 
                    key={loc.id} 
                    className={`loc-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleLocation(loc.name)}
                  >
                    <MapPin size={20} className={isSelected ? 'text-accent' : ''} />
                    <span>{loc.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="custom-input-group">
              <input 
                type="text" 
                placeholder="Other location (e.g. Singapore)" 
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomLocation()}
              />
              <button onClick={addCustomLocation} className="btn-icon"><Plus size={20} /></button>
            </div>

            <div className="selected-chips">
              {selectedLocations.filter(l => !LOCATIONS.some(loc => loc.name === l)).map(l => (
                <span key={l} className="chip" onClick={() => toggleLocation(l)}>
                  {l} <span className="chip-remove">×</span>
                </span>
              ))}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button 
                className="btn btn-primary step-next-btn"
                disabled={selectedLocations.length === 0}
                onClick={() => setStep(4)}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content animate-fade-in">
            <h2 className="step-title">Why should someone hire you?</h2>
            <p className="step-subtitle">Give a brief introduction about your background and what you bring to the table.</p>

            <div className="textarea-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <textarea 
                rows="10"
                placeholder="I am a passionate software engineer with experience in..."
                value={whyHireMe}
                onChange={(e) => setWhyHireMe(e.target.value)}
                className="glass-panel"
                style={{ 
                  width: '100%', 
                  padding: '1.25rem', 
                  color: 'white', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.05)', 
                  resize: 'vertical',
                  minHeight: '200px',
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
              />
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(3)} disabled={submitting}>Back</button>
              <button 
                className="btn btn-primary step-next-btn"
                disabled={!whyHireMe.trim() || submitting}
                onClick={handleComplete}
              >
                {submitting ? 'Finishing...' : 'Complete Setup'} <CheckCircle2 size={18} style={{ marginLeft: "8px" }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
