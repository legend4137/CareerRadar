import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter } from 'lucide-react';
import './JobFilters.css';

export default function JobFilters({ onSearch, isLoading }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [dateSincePosted, setDateSincePosted] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      keyword,
      location,
      jobType,
      remoteFilter,
      experienceLevel,
      dateSincePosted
    });
  };

  return (
    <div className="job-filters-container glass-panel">
      <form onSubmit={handleSearch} className="job-filters-form">
        <div className="filter-row primary-search">
          <div className="input-group">
            <Search size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="input-group">
            <MapPin size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="City, state, or remote" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-input"
            />
          </div>
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>
        
        <div className="filter-row secondary-filters">
          <div className="select-group">
            <Briefcase size={16} className="select-icon" />
            <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="filter-select">
              <option value="">Job Type (All)</option>
              <option value="F">Full-time</option>
              <option value="P">Part-time</option>
              <option value="C">Contract</option>
              <option value="I">Internship</option>
            </select>
          </div>
          
          <div className="select-group">
            <Filter size={16} className="select-icon" />
            <select value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)} className="filter-select">
              <option value="">Workplace (All)</option>
              <option value="1">On-site</option>
              <option value="2">Remote</option>
              <option value="3">Hybrid</option>
            </select>
          </div>
          
          <div className="select-group">
            <Clock size={16} className="select-icon" />
            <select value={dateSincePosted} onChange={(e) => setDateSincePosted(e.target.value)} className="filter-select">
              <option value="">Date Posted (Any)</option>
              <option value="r86400">Past 24 hours</option>
              <option value="r604800">Past Week</option>
              <option value="r2592000">Past Month</option>
            </select>
          </div>
          
          <div className="select-group">
            <Filter size={16} className="select-icon" />
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="filter-select">
              <option value="">Experience (All)</option>
              <option value="1">Internship</option>
              <option value="2">Entry level</option>
              <option value="3">Associate</option>
              <option value="4">Mid-Senior level</option>
              <option value="5">Director</option>
              <option value="6">Executive</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
