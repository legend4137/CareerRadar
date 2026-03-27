import React from 'react';
import './SourceSelector.css';

const SOURCES = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg',
    color: '#0a66c2',
    glow: 'rgba(10, 102, 194, 0.35)',
  },
  {
    id: 'remotive',
    label: 'Remotive',
    logo: 'https://remotive.com/favicon.ico',
    color: '#00c853',
    glow: 'rgba(0, 200, 83, 0.35)',
  },
  {
    id: 'arbeitnow',
    label: 'Arbeitnow',
    logo: 'https://www.arbeitnow.com/favicon.ico',
    color: '#ff6b35',
    glow: 'rgba(255, 107, 53, 0.35)',
  },
  {
    id: 'jobicy',
    label: 'Jobicy',
    logo: 'https://jobicy.com/favicon.ico',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.35)',
  },
];

export default function SourceSelector({ activeSource, onSourceChange }) {
  return (
    <div className="source-selector-wrapper">
      <p className="source-selector-label">Select Job Source</p>
      <div className="source-selector-grid">
        {SOURCES.map((src) => {
          const isActive = activeSource === src.id;
          return (
            <button
              key={src.id}
              className={`source-btn glass-panel${isActive ? ' source-btn--active' : ''}`}
              style={{
                '--src-color': src.color,
                '--src-glow': src.glow,
              }}
              onClick={() => onSourceChange(src.id)}
              title={`Search on ${src.label}`}
            >
              <div className="source-btn-logo-wrap">
                <img
                  src={src.logo}
                  alt={src.label}
                  className="source-btn-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span
                  className="source-btn-logo-fallback"
                  style={{ display: 'none', color: src.color }}
                >
                  {src.label[0]}
                </span>
              </div>
              <span className="source-btn-name">{src.label}</span>
              {isActive && <span className="source-btn-active-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
