import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section">
      {/* Background Decorative Elements */}
      <div className="bg-glow top-left"></div>
      <div className="bg-glow bottom-right"></div>
      
      <div className="hero-content">
        <div className="badge animate-fade-in">
          <span className="sparkle">✨</span> AI-Powered Career Assistant
        </div>
        
        <h1 className="hero-title animate-fade-in delay-100">
          Stop Missing Out on <br/>
          <span className="text-gradient">Career-Defining</span> Opportunities
        </h1>
        
        <p className="hero-subtitle animate-fade-in delay-200">
          Are you losing track of internships, hackathons, and research grants scattered across dozens of platforms? 
          <strong> OpportunityRadar</strong> uses AI to analyze your resume, discover matching opportunities, and rank them by your unique "fit score".
        </p>

        <div className="hero-cta animate-fade-in delay-300">
          <button className="btn btn-primary btn-lg">Start Free Trial 🚀</button>
          <button className="btn btn-secondary btn-lg">View Demo</button>
        </div>

        <div className="stats-container animate-fade-in delay-300">
          <div className="stat-item glass-panel">
            <h3 className="stat-value">10k+</h3>
            <p className="stat-label">Opportunities Curated</p>
          </div>
          <div className="stat-item glass-panel">
            <h3 className="stat-value">95%</h3>
            <p className="stat-label">Match Accuracy</p>
          </div>
          <div className="stat-item glass-panel">
            <h3 className="stat-value">0</h3>
            <p className="stat-label">Missed Deadlines</p>
          </div>
        </div>
      </div>
    </section>
  );
}
