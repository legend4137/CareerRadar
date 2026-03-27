import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import SourceSelector from '../components/SourceSelector';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';
import './Dashboard.css';

// Map source id → API endpoint builder
const SOURCE_LABELS = {
  linkedin: 'LinkedIn',
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  jobicy: 'Jobicy',
};

function buildUrl(source, filters) {
  const p = new URLSearchParams();

  switch (source) {
    case 'linkedin': {
      if (filters.keyword)        p.append('keyword', filters.keyword);
      if (filters.location)       p.append('location', filters.location);
      if (filters.jobType)        p.append('jobType', filters.jobType);
      if (filters.remoteFilter)   p.append('remoteFilter', filters.remoteFilter);
      if (filters.experienceLevel) p.append('experienceLevel', filters.experienceLevel);
      if (filters.dateSincePosted) p.append('dateSincePosted', filters.dateSincePosted);
      p.append('limit', '150');
      return `http://localhost:8001/api/jobs/search?${p}`;
    }
    case 'remotive': {
      if (filters.keyword) p.append('keyword', filters.keyword);
      p.append('limit', '50');
      return `http://localhost:8001/api/remotive-jobs/search?${p}`;
    }
    case 'arbeitnow': {
      if (filters.keyword)      p.append('keyword', filters.keyword);
      if (filters.location)     p.append('location', filters.location);
      if (filters.remoteFilter) p.append('remote', filters.remoteFilter); // 'true' or ''
      p.append('limit', '50');
      return `http://localhost:8001/api/arbeitnow-jobs/search?${p}`;
    }
    case 'jobicy': {
      if (filters.keyword)  p.append('keyword', filters.keyword);
      if (filters.location) p.append('location', filters.location);
      p.append('limit', '50');
      return `http://localhost:8001/api/jobicy-jobs/search?${p}`;
    }
    default:
      return `http://localhost:8001/api/jobs/search?${p}`;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSource, setActiveSource] = useState('linkedin');

  const jobsPerPage = 20;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const handleSourceChange = (src) => {
    setActiveSource(src);
    setJobs([]);
    setError(null);
    setCurrentPage(1);
  };

  const searchJobs = async (filters) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.jobType) queryParams.append('jobType', filters.jobType);
      if (filters.remoteFilter) queryParams.append('remoteFilter', filters.remoteFilter);
      if (filters.experienceLevel) queryParams.append('experienceLevel', filters.experienceLevel);
      if (filters.dateSincePosted) queryParams.append('dateSincePosted', filters.dateSincePosted);
      queryParams.append('limit', '150');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs.');
      }
      const data = await response.json();
      // Inject source label into each job for the modal "Apply on X" text
      const labelled = (data.jobs || []).map((j) => ({
        ...j,
        source: j.source || SOURCE_LABELS[activeSource],
      }));
      setJobs(labelled);
    } catch (err) {
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const sourceLabel = SOURCE_LABELS[activeSource];

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, <span className="text-gradient">{user?.name}</span> 👋</h1>
        <p className="dashboard-subtitle">Search for the best {user?.role || ''} opportunities below.</p>
      </div>

      <div className="dashboard-content">
        {/* ── Source picker ── */}
        <SourceSelector activeSource={activeSource} onSourceChange={handleSourceChange} />

        {/* ── Filters (adapts per source) ── */}
        <JobFilters onSearch={searchJobs} isLoading={isLoading} source={activeSource} />

        {error && (
          <div
            className="error-message glass-panel"
            style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', padding: '1rem', marginBottom: '2rem' }}
          >
            {error}
          </div>
        )}

        <div className="jobs-results">
          {isLoading ? (
            <div className="loading-state text-center" style={{ padding: '3rem' }}>
              <div
                className="spinner"
                style={{
                  border: '4px solid rgba(255,255,255,0.1)',
                  borderTop: '4px solid var(--accent-primary)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem',
                }}
              />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3>Scanning {sourceLabel} for Jobs...</h3>
              <p style={{ color: 'var(--text-secondary)' }}>This might take a moment as we fetch and aggregate data.</p>
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div
                className="results-header"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
              >
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                  Found <span className="text-gradient">{jobs.length}</span> Roles on{' '}
                  <span className="text-gradient">{sourceLabel}</span>
                </h2>
              </div>

              <div className="jobs-list">
                {currentJobs.map((job, idx) => (
                  <JobCard key={job.job_id || idx} job={job} onClick={setSelectedJob} />
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  className="pagination-controls"
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem 0' }}
                >
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    style={{ background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <span style={{ color: 'var(--text-secondary)' }}>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    style={{ background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              className="empty-state text-center glass-panel"
              style={{ padding: '4rem 2rem', borderStyle: 'dashed' }}
            >
              <FileSearch size={48} color="var(--text-muted, #9ca3af)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h2 style={{ color: 'var(--text-secondary)' }}>No jobs here yet</h2>
              <p style={{ color: 'var(--text-muted, #9ca3af)' }}>
                Select a source above and use the filters to start your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
