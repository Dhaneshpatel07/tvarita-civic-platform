import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Users, Target, Activity } from 'lucide-react';
import logo from '../assets/tvarita-logo.png';

const PublicMetrics = () => {
  const [metrics, setMetrics] = useState({
    total: 0,
    resolved: 0,
    potholes: 0,
    communityEngagement: 0
  });

  useEffect(() => {
    // Fast polling to create a "Live Tracker" Gamified Feel
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/issues/public/metrics');
        setMetrics(data);
      } catch (err) {
        console.error("Aggregation failed", err);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveRate = metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', width: '100%', color: 'white', padding: '40px 20px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', flexDirection: 'column' }}>
           <img src={logo} alt="Tvarita Logo" style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} />
           <div style={{ fontFamily: '"Noto Sans Devanagari", sans-serif', color: '#818cf8', fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>
              त्वरितं समाधानम् • पारदर्शकता
           </div>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
          Tvarita Civic Transparency
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '50px', maxWidth: '600px', margin: '0 auto 50px' }}>
          Real-time, gamified metrics proving how fast our municipal government is physically clearing civic issues reported by your community.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
            <Activity color="#38bdf8" size={32} style={{ marginBottom: '15px' }} />
            <h2 style={{ fontSize: '3.5rem', margin: '0', color: '#f8fafc', fontWeight: '900' }}>{metrics.total}</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Total Issues Tracked</p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
             <ShieldCheck color="#34d399" size={32} style={{ marginBottom: '15px' }} />
             <h2 style={{ fontSize: '3.5rem', margin: '0', color: '#f8fafc', fontWeight: '900' }}>{resolveRate}%</h2>
             <p style={{ color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Municipal Resolution Rate</p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
             <Target color="#fbbf24" size={32} style={{ marginBottom: '15px' }} />
             <h2 style={{ fontSize: '3.5rem', margin: '0', color: '#f8fafc', fontWeight: '900' }}>{metrics.potholes}</h2>
             <p style={{ color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Hazardous Potholes Logged</p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
             <Users color="#f472b6" size={32} style={{ marginBottom: '15px' }} />
             <h2 style={{ fontSize: '3.5rem', margin: '0', color: '#f8fafc', fontWeight: '900' }}>{metrics.communityEngagement}</h2>
             <p style={{ color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Physical Citizen Upvotes Verified</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PublicMetrics;
