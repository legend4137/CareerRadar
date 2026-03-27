import React from 'react';
import { MapPin, Building, ExternalLink, Tag } from 'lucide-react';
import './JobCard.css';

export default function JobCard({ job }) {
  return (
    <div className="job-card glass-panel">
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{job.title || 'Untitled Position'}</h3>
          <div className="job-company">
            <Building size={16} />
            <span>{job.company || 'Unknown Company'}</span>
          </div>
        </div>
        {job.link && (
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="apply-btn">
            View Job <ExternalLink size={14} />
          </a>
        )}
      </div>
      
      <div className="job-location">
        <MapPin size={16} />
        <span>{job.location || 'Location not specified'}</span>
      </div>

      <div className="job-description">
        {job.description 
          ? job.description.length > 200 
            ? `${job.description.substring(0, 200)}...` 
            : job.description
          : 'No full description available for this position. Click "View Job" to see more details on LinkedIn.'}
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="job-tags">
          <Tag size={14} className="tag-icon" />
          {job.tags.map((tag, idx) => (
            <span key={idx} className="job-tag-badge">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
