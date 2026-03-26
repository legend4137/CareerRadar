import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, CheckCircle2, ChevronRight, Briefcase, Code, LineChart, Megaphone, MonitorSmartphone, Target } from 'lucide-react';
import './Onboarding.css';

const ROLES = [
  { id: 'swe', name: 'Software Engineer', icon: Code },
  { id: 'ml', name: 'Machine Learning', icon: MonitorSmartphone },
  { id: 'data', name: 'Data Analyst', icon: LineChart },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'sales', name: 'Sales', icon: Target },
  { id: 'other', name: 'Other / Product', icon: Briefcase },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [file, setFile] = useState(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleComplete = () => {
    updateProfile({
      role: selectedRole.name,
      resumeUploaded: file ? true : false
    });
    navigate('/dashboard');
  };

  return (
    <div className="onboard-container animate-fade-in">
      <div className="onboard-card glass-panel">
        {/* Progress Bar */}
        <div className="onboard-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {step === 1 ? (
          <div className="step-content animate-fade-in">
            <h2 className="step-title">What field are you looking to apply in?</h2>
            <p className="step-subtitle">This helps our AI personalize your Opportunity Radar.</p>
            
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

            <button 
              className="btn btn-primary step-next-btn"
              disabled={!selectedRole}
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

              {file && (
                <div className="file-preview animate-fade-in">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn btn-primary step-next-btn"
                disabled={!file}
                onClick={handleComplete}
              >
                Complete Profile <CheckCircle2 size={18} style={{ marginLeft: "8px" }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
