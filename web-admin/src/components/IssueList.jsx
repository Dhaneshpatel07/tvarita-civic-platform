import React, { useState } from 'react';
import { Image as ImageIcon, Eye, X } from 'lucide-react';

const IssueList = ({ issues = [], updateStatus }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewCaption, setPreviewCaption] = useState('');

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return 'badge-open';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return 'badge-open';
    }
  };

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span>Recent Community Reports</span>
        <div className="filters" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="search" 
            placeholder="🔍 Search reports..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', minWidth: '200px' }}
          />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Water Leak">Water Leak</option>
            <option value="Other">Other</option>
          </select>
          <select 
            className="action-select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Issue Title</th>
            <th>Media</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Date Reported</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.map((issue) => (
            <tr key={issue._id}>
              <td style={{ fontWeight: 500 }}>{issue.title}</td>
              <td style={{ textAlign: 'center' }}>
                {issue.imageUrl && issue.imageUrl.trim() !== '' ? (
                  <div 
                    onClick={() => { setPreviewImage(issue.imageUrl); setPreviewCaption(issue.aiCaption); }} 
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                  >
                    <img 
                       src={issue.imageUrl} 
                       alt="Thumbnail" 
                       style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s' }} 
                    />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                       <Eye size={18} color="white" />
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>N/A</span>
                )}
              </td>
              <td>{issue.category}</td>
              <td>
                <span 
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    border: '1px solid #D1D5DB', 
                    fontWeight: 'bold',
                    color: issue.priority === 'Critical' ? '#EF4444' : issue.priority === 'High' ? '#F97316' : '#374151',
                    backgroundColor: '#F9FAFB' 
                  }}
                >
                  {issue.priority === 'Critical' ? '🚨 ' : issue.priority === 'High' ? '⬆ ' : issue.priority === 'Low' ? '⬇ ' : '➖ '}  
                  {issue.priority || 'Medium'}
                </span>
              </td>
              <td>
                <span className={`badge ${getStatusBadge(issue.status)}`}>
                  {issue.status}
                </span>
              </td>
              <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
              <td>
                <select 
                  className="action-select"
                  value={issue.status}
                  onChange={(e) => updateStatus(issue._id, e.target.value)}
                >
                  <option value="Open">Mark Open</option>
                  <option value="In Progress">Mark In Progress</option>
                  <option value="Resolved">Mark Resolved</option>
                </select>
              </td>
            </tr>
          ))}
          {filteredIssues.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                No active reports match your current search or filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="card" 
            style={{ maxWidth: '800px', width: '100%', position: 'relative', padding: '10px', backgroundColor: '#0f172a' }}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#EF4444', color: 'white', borderRadius: '50%', width: '35px', height: '35px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}
            >
              <X size={20} />
            </button>
            <img 
              src={previewImage} 
              alt="High Res Proof" 
              style={{ width: '100%', borderRadius: '12px', maxHeight: '70vh', objectFit: 'contain' }} 
            />
            {previewCaption && (
               <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Verification Details</h4>
                  <p style={{ color: '#fff', fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.9 }}>"{previewCaption || 'Image verified as valid civic content.'}"</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueList;
