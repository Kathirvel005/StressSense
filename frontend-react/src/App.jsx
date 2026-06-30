import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import AdminDashboard from './pages/AdminDashboard';
import { Activity, LayoutDashboard, BrainCircuit, ShieldAlert, LogOut, Menu, User as UserIcon } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { user, logout, isOfflineMode } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <>
        {isOfflineMode && (
          <div className="bg-warning text-dark text-center fw-bold py-2 small font-title shadow-sm" style={{ zIndex: 1000, position: 'relative', fontSize: '11px' }}>
            ⚠️ Demo Mode Active: The local backend server is not running. Authentication and AI predictions are running locally in your browser.
          </div>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      {user && (
        <aside className="glass-panel d-flex flex-column p-3 m-3" style={{ width: '260px', zIndex: 10 }}>
          <div className="d-flex align-items-center gap-2 mb-4 px-2">
            <div className="p-2 bg-primary rounded-3 text-white d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)' }}>
              <Activity size={24} />
            </div>
            <div>
              <span className="h5 mb-0 fw-bold d-block font-title text-gradient-purple">StressSense</span>
              <div className="d-flex align-items-center gap-2">
                <small className="text-secondary fw-semibold">AI Stress Predictor</small>
                {isOfflineMode && (
                  <span className="badge bg-warning text-dark font-title" style={{ fontSize: '8px', padding: '2px 4px', fontWeight: 'bold' }}>DEMO</span>
                )}
              </div>
            </div>
          </div>

          <hr className="my-2 border-secondary" style={{ opacity: 0.15 }} />

          <nav className="nav flex-column gap-2 my-3">
            <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/predict" className={`sidebar-link ${location.pathname === '/predict' ? 'active' : ''}`}>
              <BrainCircuit size={20} />
              <span>Early Predictor</span>
            </Link>
            {user.role === 'ROLE_ADMIN' && (
              <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <ShieldAlert size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="mt-auto">
            <div className="glass-panel p-3 mb-3 d-flex align-items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: 'rgba(168, 85, 247, 0.1)' }}>
                <UserIcon size={18} className="text-purple" style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div className="overflow-hidden">
                <span className="d-block fw-bold text-truncate" style={{ fontSize: '14px' }}>{user.username}</span>
                <span className="d-block text-secondary text-truncate" style={{ fontSize: '11px' }}>{user.role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}</span>
              </div>
            </div>
            
            <button onClick={logout} className="btn w-100 sidebar-link border-0 text-danger text-start hover-bg-danger-subtle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-grow-1 p-4 d-flex flex-column overflow-auto" style={{ height: '100vh' }}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/predict" element={
            <ProtectedRoute>
              <Predictor />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
