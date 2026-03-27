import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter, Globe, Tag } from 'lucide-react';
import './JobFilters.css';

// Per-source filter definitions
const SOURCE_CONFIG = {
  linkedin: {
    showLocation: true,
    showJobType: true,
    showRemote: true,
    showDatePosted: true,
    showExperience: true,
    placeholders: {
      keyword: 'Job title, keywords, or company',
      location: 'City, state, or remote',
    },
  },
  remotive: {
    showLocation: false,
    showJobType: false,
    showRemote: false,
    showDatePosted: false,
    showExperience: false,
    placeholders: {
      keyword: 'Role, skill, or keyword',
      location: '',
    },
  },
  arbeitnow: {
    showLocation: true,
    showJobType: false,
    showRemote: true,
    showDatePosted: false,
    showExperience: false,
    placeholders: {
      keyword: 'Role, skill, or keyword',
      location: 'City or country (optional)',
    },
  },
  jobicy: {
    showLocation: true,
    showJobType: false,
    showRemote: false,
    showDatePosted: false,
    showExperience: false,
    placeholders: {
      keyword: 'Tag or skill (e.g. python)',
      location: 'Region / geo (e.g. europe)',
    },
  },
};

export default function JobFilters({ onSearch, isLoading, source = 'linkedin' }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [dateSincePosted, setDateSincePosted] = useState('');

  // Reset secondary filters when source changes
  useEffect(() => {
    setJobType('');
    setRemoteFilter('');
    setExperienceLevel('');
    setDateSincePosted('');
    setLocation('');
  }, [source]);

  const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.linkedin;

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      keyword,
      location,
      jobType,
      remoteFilter,
      experienceLevel,
      dateSincePosted,
    });
  };

  return (
    <div className="job-filters-container glass-panel">
      <form onSubmit={handleSearch} className="job-filters-form">
        {/* ── Primary search row ── */}
        <div className="filter-row primary-search">
          <div className="input-group">
            <Search size={20} className="input-icon" />
            <input
              type="text"
              placeholder={cfg.placeholders.keyword}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="filter-input"
            />
          </div>

          {cfg.showLocation && (
            <div className="input-group">
              <MapPin size={20} className="input-icon" />
              <input
                type="text"
                placeholder={cfg.placeholders.location}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="filter-input"
              />
            </div>
          )}

          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>

        {/* ── Secondary filters (only shown for LinkedIn and Arbeitnow) ── */}
        {(cfg.showJobType || cfg.showRemote || cfg.showDatePosted || cfg.showExperience) && (
          <div className="filter-row secondary-filters">
            {cfg.showJobType && (
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
            )}

            {cfg.showRemote && source === 'linkedin' && (
              <div className="select-group">
                <Globe size={16} className="select-icon" />
                <select value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)} className="filter-select">
                  <option value="">Workplace (All)</option>
                  <option value="1">On-site</option>
                  <option value="2">Remote</option>
                  <option value="3">Hybrid</option>
                </select>
              </div>
            )}

            {cfg.showRemote && source === 'arbeitnow' && (
              <div className="select-group">
                <Globe size={16} className="select-icon" />
                <select value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)} className="filter-select">
                  <option value="">Workplace (All)</option>
                  <option value="true">Remote only</option>
                </select>
              </div>
            )}

            {cfg.showDatePosted && (
              <div className="select-group">
                <Clock size={16} className="select-icon" />
                <select value={dateSincePosted} onChange={(e) => setDateSincePosted(e.target.value)} className="filter-select">
                  <option value="">Date Posted (Any)</option>
                  <option value="r86400">Past 24 hours</option>
                  <option value="r604800">Past Week</option>
                  <option value="r2592000">Past Month</option>
                </select>
              </div>
            )}

            {cfg.showExperience && (
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
            )}
          </div>
        )}
      </form>
    </div>
  );
}
