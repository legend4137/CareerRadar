import React from 'react';
import { Bot, Globe2, ListFilter, Zap } from 'lucide-react';
import './Features.css';

export default function Features() {
  const features = [
    {
      id: 1,
      title: 'AI Resume Matching',
      description: 'Upload your resume once. Our intelligent engine reads your skills and scores every job to find your perfect fit.',
      icon: <Bot size={32} />
    },
    {
      id: 2,
      title: 'Global Aggregation',
      description: 'Stop checking 10 different boards. We seamlessly aggregate hidden gems from LinkedIn, Remotive, Jobicy, and more.',
      icon: <Globe2 size={32} />
    },
    {
      id: 3,
      title: 'Lightning Fast Filters',
      description: 'Drill down by remote status, location, and role instantaneously without waiting for cumbersome page reloads.',
      icon: <ListFilter size={32} />
    },
    {
      id: 4,
      title: 'Smart Preferences',
      description: 'Set your target roles and regions during onboarding to automatically curate your personalized dashboard feed every time.',
      icon: <Zap size={32} />
    }
  ];

  return (
    <section id="features" className="features-section animate-fade-in">
      <div className="features-header">
        <h2 className="section-title">Why choose <span className="text-gradient">CareerRadar?</span></h2>
        <p className="section-subtitle">A modern toolkit engineered to accelerate your career growth.</p>
      </div>

      <div className="features-grid">
        {features.map(f => (
          <div key={f.id} className="feature-card glass-panel">
            <div className="icon-wrapper">
              {f.icon}
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
