import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js';
import { 
  Users as UsersIcon, 
  Cpu, 
  Activity, 
  Trash2, 
  AlertCircle,
  Database,
  BarChart3,
  CheckCircle
} from 'lucide-react';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale
);

const AdminDashboard = () => {
  const { authFetch } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminSummary = async () => {
    try {
      const summaryRes = await authFetch('http://localhost:8080/api/analytics/admin-summary');
      const usersRes = await authFetch('http://localhost:8080/api/admin/users');
      
      if (!summaryRes.ok || !usersRes.ok) throw new Error('Failed to retrieve system aggregates');
      
      const summaryData = await summaryRes.json();
      const usersData = await usersRes.json();
      
      setAdminData(summaryData);
      setUsersList(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSummary();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    
    try {
      const res = await authFetch(`http://localhost:8080/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Could not delete user');
      
      setActionMessage(`User "${name}" has been deleted.`);
      // Refresh list
      setUsersList(prev => prev.filter(u => u.id !== id));
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 glass-panel m-3 p-4 text-center">
        <h4 className="alert-heading font-title">Admin Loading Failed</h4>
        <p className="mb-0 text-secondary">{error}</p>
        <button onClick={fetchAdminSummary} className="btn btn-premium-primary mt-3">Retry</button>
      </div>
    );
  }

  const { stressLevelDistribution, globalAverageStressLevel, mlMetrics } = adminData || {
    stressLevelDistribution: { 0: 0, 1: 0, 2: 0 },
    globalAverageStressLevel: 0,
    mlMetrics: { accuracy: 0, feature_importances: {} }
  };

  // Stress Level Distribution Doughnut Setup
  const distributionData = {
    labels: ['Low Stress', 'Medium Stress', 'High Stress'],
    datasets: [
      {
        data: [
          stressLevelDistribution[0] || 0,
          stressLevelDistribution[1] || 0,
          stressLevelDistribution[2] || 0
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['rgba(20,21,33,0.9)'],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', weight: 'bold' }
        }
      }
    }
  };

  // Feature Importance Bar Chart Setup
  const rawImportances = mlMetrics.feature_importances || {};
  // Sort and limit to top 8 importances
  const sortedImportances = Object.entries(rawImportances)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const importanceData = {
    labels: sortedImportances.map(([name]) => name.replace(/_/g, ' ')),
    datasets: [
      {
        label: 'Relative Weight',
        data: sortedImportances.map(([, val]) => val),
        backgroundColor: 'rgba(59, 130, 246, 0.65)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const importanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="container-fluid py-2 animate-fade-in">
      <div className="mb-4">
        <h1 className="fw-extrabold mb-1">Admin Dashboard</h1>
        <p className="text-secondary small mb-0">System-wide metrics and machine learning model parameters</p>
      </div>

      {actionMessage && (
        <div className="alert alert-success border-0 glass-panel py-3 px-4 mb-4 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', color: '#a7f3d0' }}>
          <CheckCircle size={18} />
          <span className="small fw-semibold">{actionMessage}</span>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-panel p-4 d-flex align-items-center gap-3">
            <div className="p-3 bg-primary rounded-4 text-white d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)' }}>
              <UsersIcon size={24} />
            </div>
            <div>
              <span className="d-block text-secondary small fw-bold font-title">Total Users</span>
              <h3 className="mb-0 fw-bold font-title mt-1">{usersList.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-panel p-4 d-flex align-items-center gap-3">
            <div className="p-3 bg-success rounded-4 text-white d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Cpu size={24} />
            </div>
            <div>
              <span className="d-block text-secondary small fw-bold font-title">ML Model Accuracy</span>
              <h3 className="mb-0 fw-bold font-title mt-1">
                {mlMetrics.accuracy ? `${Math.round(mlMetrics.accuracy * 100)}%` : 'N/A'}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-panel p-4 d-flex align-items-center gap-3">
            <div className="p-3 bg-warning rounded-4 text-white d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Activity size={24} />
            </div>
            <div>
              <span className="d-block text-secondary small fw-bold font-title">Avg System Stress</span>
              <h3 className="mb-0 fw-bold font-title mt-1">
                {globalAverageStressLevel !== null ? globalAverageStressLevel.toFixed(2) : '0.00'} / 2
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-4 mb-4">
        {/* Doughnut Chart */}
        <div className="col-lg-5">
          <div className="glass-panel p-4" style={{ height: '360px' }}>
            <h5 className="font-title mb-4 d-flex align-items-center gap-2">
              <Database size={18} className="text-primary" />
              <span>Stress Level Distribution</span>
            </h5>
            <div style={{ height: '240px' }} className="d-flex align-items-center justify-content-center">
              <Doughnut data={distributionData} options={distributionOptions} />
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-lg-7">
          <div className="glass-panel p-4" style={{ height: '360px' }}>
            <h5 className="font-title mb-3 d-flex align-items-center gap-2">
              <BarChart3 size={18} className="text-purple" style={{ color: 'var(--accent-purple)' }} />
              <span>Classifier Feature Importances</span>
            </h5>
            <p className="text-secondary small mb-3">Strongest mathematical stress predictors in Random Forest model</p>
            <div style={{ height: '210px' }}>
              {sortedImportances.length > 0 ? (
                <Bar data={importanceData} options={importanceOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-secondary">
                  No model importances available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass-panel p-4">
        <h5 className="font-title mb-4 d-flex align-items-center gap-2">
          <UsersIcon size={18} className="text-info" />
          <span>User Registry & Management</span>
        </h5>
        
        <div className="table-responsive">
          <table className="table table-dark table-hover border-0 mb-0">
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="border-secondary pb-3" style={{ borderOpacity: 0.1 }}>User ID</th>
                <th className="border-secondary pb-3" style={{ borderOpacity: 0.1 }}>Username</th>
                <th className="border-secondary pb-3" style={{ borderOpacity: 0.1 }}>Email</th>
                <th className="border-secondary pb-3" style={{ borderOpacity: 0.1 }}>Role</th>
                <th className="border-secondary pb-3 text-end" style={{ borderOpacity: 0.1 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr key={user.id} className="align-middle">
                  <td className="border-secondary py-3 text-secondary" style={{ borderOpacity: 0.05 }}>#{user.id}</td>
                  <td className="border-secondary py-3 fw-semibold" style={{ borderOpacity: 0.05 }}>{user.username}</td>
                  <td className="border-secondary py-3 text-secondary" style={{ borderOpacity: 0.05 }}>{user.email}</td>
                  <td className="border-secondary py-3" style={{ borderOpacity: 0.05 }}>
                    <span className={`badge rounded-pill ${user.role === 'ROLE_ADMIN' ? 'bg-danger' : 'bg-primary'}`} style={{ opacity: 0.85 }}>
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="border-secondary py-3 text-end" style={{ borderOpacity: 0.05 }}>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.username)} 
                      className="btn btn-sm btn-outline-danger border-0 hover-bg-danger-subtle p-2"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
