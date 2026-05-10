import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import IssueList from '../components/IssueList';
import HeatmapLayer from '../components/HeatmapLayer';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const MUNICIPALITIES = {
  'All': null,
  'GHMC (Hyderabad)': [17.3850, 78.4867],
  'BMC (Mumbai)': [19.0760, 72.8777],
  'BBMP (Bengaluru)': [12.9716, 77.5946]
};

// Client-side Haversine Distance (in meters)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ChangeView = ({ issues }) => {
  const map = useMap();
  useEffect(() => {
    if (issues && issues.length > 0) {
      const lats = issues.map(i => i.location?.coordinates[1]).filter(v => v);
      const lngs = issues.map(i => i.location?.coordinates[0]).filter(v => v);
      if (lats.length > 0 && lngs.length > 0) {
        const bounds = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        ];
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [issues, map]);
  return null;
};

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeCity, setActiveCity] = useState('All');

  // Fallback spatial center if database is absolutely completely empty
  const defaultCenter = [17.3850, 78.4867]; 

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await api.get('/issues');
        setIssues(data);
      } catch (error) {
        console.warn('Backend missing or JWT intercept error. Clearing active display view.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000); // 5-second aggressive polling
    return () => clearInterval(interval);
  }, []);

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/issues');
      setIssues(data);
    } catch(e) {}
    setLoading(false);
  };

  const openIssuesCount = issues.filter(i => i.status === 'Open').length;
  const progressIssuesCount = issues.filter(i => i.status === 'In Progress').length;
  const resolvedIssuesCount = issues.filter(i => i.status === 'Resolved').length;

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/issues/${id}/status`, { status: newStatus });
      setIssues(issues.map(issue => issue._id === id ? { ...issue, status: newStatus } : issue));
    } catch (error) {
      alert("Critical Error: Web Dashboard failed to alter issue permissions in Mongo Atlas.");
    }
  };

  const filteredGeoIssues = activeCity === 'All' ? issues : issues.filter(issue => {
     if (!issue.location?.coordinates) return false;
     const [lng, lat] = issue.location.coordinates;
     const centerLoc = MUNICIPALITIES[activeCity];
     // Keep issues within a 50 Kilometers radius of the Municipality Anchor
     return getDistance(lat, lng, centerLoc[0], centerLoc[1]) < 50000;
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Tvarita Dashboard</h1>
        <p className="sidebar-tagline" style={{ paddingLeft: 0, opacity: 1, marginBottom: 0 }}>त्वरितं समाधानम् • पारदर्शकता</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>Open Issues</h3>
            <p>{openIssuesCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <p>{progressIssuesCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#10B981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <p>{resolvedIssuesCount}</p>
          </div>
        </div>
      </div>
      
      {/* 📊 Municipal Efficiency Progress Engine */}
      <div className="card" style={{ marginBottom: '25px', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '1px' }}>RESOLUTION PROGRESS</h4>
            <span style={{ fontWeight: '900', color: '#10B981', fontSize: '1.25rem', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>
               {issues.length > 0 ? Math.round((resolvedIssuesCount / (issues.length + resolvedIssuesCount)) * 100) : 0}%
            </span>
         </div>
         <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
               style={{ 
                  width: `${(issues.length + resolvedIssuesCount) > 0 ? (resolvedIssuesCount / (issues.length + resolvedIssuesCount)) * 100 : 0}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #10B981, #34D399)', 
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
               }} 
            />
         </div>
         <p style={{ marginTop: '10px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            * This progress is calculated using live civic resolution records.
         </p>
      </div>

      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Geographic Issue Map</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={activeCity} 
              onChange={(e) => setActiveCity(e.target.value)} 
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            >
              {Object.keys(MUNICIPALITIES).map(city => <option key={city} value={city}>{city === 'All' ? 'All Zones' : city}</option>)}
            </select>
            <button 
              onClick={manualRefresh} 
              style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#f8fafc', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginRight: '10px' }}
            >
              {loading ? '🔄 Syncing...' : '🔄 Pull Live Data'}
            </button>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)} 
              style={{ padding: '8px 16px', backgroundColor: showHeatmap ? '#EF4444' : '#4F46E5', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              {showHeatmap ? '🔥 Heatmap Active' : '📍 Map Pins View'}
            </button>
          </div>
        </div>
        <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false}>
          <ChangeView issues={filteredGeoIssues} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {showHeatmap ? (
            <HeatmapLayer issues={filteredGeoIssues} />
          ) : (
            filteredGeoIssues.map(issue => {
              if(issue.location && issue.location.coordinates && issue.status !== 'Resolved') {
                 const [lng, lat] = issue.location.coordinates;
                return (
                  <Marker key={issue._id} position={[lat, lng]}>
                    <Popup>
                      <div style={{ minWidth: issue.imageUrl ? '150px' : 'auto' }}>
                        <strong style={{ fontSize: '14px' }}>{issue.title}</strong><br/>
                        <span style={{ color: '#6B7280', fontSize: '12px' }}>Status: {issue.status}</span>
                        {issue.imageUrl && (
                           <img 
                             src={issue.imageUrl} 
                             alt="Reported civic issue" 
                             style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px', cursor: 'pointer' }} 
                             onClick={() => window.open(issue.imageUrl, '_blank')}
                             onError={(e) => { e.target.style.display = 'none'; }}
                           />
                        )}
                        {issue.aiCaption && (
                           <div style={{ marginTop: '5px', fontSize: '11px', color: 'var(--primary)', fontStyle: 'italic', lineHeight: '1.2' }}>
                              "AI: {issue.aiCaption}"
                           </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })
          )}
        </MapContainer>
      </div>

      <div id="all-issues-section">
        <IssueList issues={filteredGeoIssues} updateStatus={handleStatusUpdate} />
      </div>
    </div>
  );
};

export default Dashboard;
