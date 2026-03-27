import React from 'react';
import { MapPin, Building, ExternalLink, Tag, DollarSign } from 'lucide-react';
import './JobCard.css';

export default function JobCard({ job, onClick }) {
  const handleApplyClick = (e) => {
    e.stopPropagation(); // prevent modal from opening when clicking apply
  };

  return (
    <div className="job-card glass-panel" onClick={() => onClick && onClick(job)}>
      <div className="job-card-header">
        <div className="job-info-main">
          {job.logo ? (
            <img src={job.logo} alt={`${job.company} logo`} className="job-logo" />
          ) : (
            <div className="job-logo-placeholder">
              <Building size={24} color="var(--text-secondary)" />
            </div>
          )}
          <div>
            <h3 className="job-title">{job.title || 'Untitled Position'}</h3>
            <div className="job-company">
              <span>{job.company || 'Unknown Company'}</span>
            </div>
          </div>
        </div>
        {job.link && (
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="apply-btn" onClick={handleApplyClick}>
            Apply <ExternalLink size={14} />
          </a>
        )}
      </div>
      
      <div className="job-card-meta">
        <div className="meta-item">
          <MapPin size={16} />
          <span>{job.location || 'Location not specified'}</span>
        </div>
        <div className="meta-item salary-item">
          <DollarSign size={16} />
          <span>{job.salary || 'Undisclosed Salary'}</span>
        </div>
      </div>

      <div className="job-description">
        {job.description 
          ? job.description.length > 200 
            ? `${job.description.substring(0, 200)}...` 
            : job.description
          : 'No full description available. Click to view more details or apply on LinkedIn.'}
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="job-tags">
          <Tag size={14} className="tag-icon" />
          {job.tags.slice(0, 4).map((tag, idx) => (
            <span key={idx} className="job-tag-badge">{tag}</span>
          ))}
          {job.tags.length > 4 && (
            <span className="job-tag-badge">+{job.tags.length - 4} more</span>
          )}
        </div>
      )}
    </div>
  );
}
