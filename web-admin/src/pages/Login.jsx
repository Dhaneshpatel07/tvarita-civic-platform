import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
       setError(err.response?.data?.message || err.message || 'Login Failed');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 20px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
         <h1 className="card-title" style={{ textAlign: 'center', marginBottom: '8px', borderBottom: 'none', paddingBottom: 0, fontSize: '24px' }}>Tvarita Admin</h1>
         <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Sign in to manage city issues</p>
         
         {error && (
           <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
             {error}
           </div>
         )}

         <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="input" 
                placeholder="admin@tvarita.com"
                style={{ width: '100%', padding: '12px' }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="input" 
                placeholder="Your password"
                style={{ width: '100%', padding: '12px' }}
              />
            </div>

            <button type="submit" className="btn" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' }}>
               Log In
            </button>
         </form>
         
         <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            <p><strong>Default Admin:</strong> admin@gmail.com / admin123</p>
            <p style={{ marginTop: '4px', opacity: 0.7 }}>Master Admin: admin@tvarita.com / dhanesh</p>
         </div>
      </div>
    </div>
  );
};

export default Login;
