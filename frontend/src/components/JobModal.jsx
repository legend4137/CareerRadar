import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Building, ExternalLink, Tag, DollarSign, Calendar } from 'lucide-react';
import './JobModal.css';

export default function JobModal({ job, onClose }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!job) return null;

  return createPortal(
    <div className="job-modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="job-modal-content glass-panel animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="job-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="job-modal-header">
          <div className="job-modal-info-main">
            {job.logo ? (
              <img src={job.logo} alt={`${job.company} logo`} className="job-modal-logo" />
            ) : (
              <div className="job-modal-logo-placeholder">
                <Building size={32} color="var(--text-secondary)" />
              </div>
            )}
            <div>
              <h2 className="job-modal-title">{job.title || 'Untitled Position'}</h2>
              <div className="job-modal-company">
                {job.company || 'Unknown Company'}
              </div>
            </div>
          </div>
          
          {job.link && (
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-modal-apply-btn">
              Apply on LinkedIn <ExternalLink size={16} />
            </a>
          )}
        </div>

        <div className="job-modal-meta">
          <div className="job-modal-meta-item">
            <MapPin size={18} />
            <span>{job.location || 'Location not specified'}</span>
          </div>
          <div className="job-modal-meta-item salary-item">
            <DollarSign size={18} />
            <span>{job.salary || 'Undisclosed Salary'}</span>
          </div>
        </div>

        <div className="job-modal-divider"></div>

        <div className="job-modal-body">
          <h3>Job Description</h3>
          <div className="job-modal-description">
            {job.description || 'No full description available for this position. Please click "Apply on LinkedIn" to view more details directly.'}
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="job-modal-tags-container">
              <h3>Required Skills & Tags</h3>
              <div className="job-modal-tags">
                {job.tags.map((tag, idx) => (
                  <span key={idx} className="job-tag-badge">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
