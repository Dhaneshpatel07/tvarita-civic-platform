import React, { useContext } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/tvarita-logo.png';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/home' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={logo} alt="Tvarita Logo" style={{ height: '50px', width: 'auto', marginBottom: '8px', filter: 'brightness(1.1)' }} />
        <div className="sidebar-tagline">त्वरितं समाधानम् • पारदर्शकता</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={location.pathname === item.path ? 'nav-item active' : 'nav-item'}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <button 
            onClick={logout}
            className="nav-item"
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#EF4444'
            }}
          >
            <LogOut size={20} />
            <span style={{ fontWeight: '600' }}>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
