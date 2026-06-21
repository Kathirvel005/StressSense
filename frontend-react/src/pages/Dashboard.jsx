import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { 
  Activity, 
  Flame, 
  Smile, 
  Frown, 
  BedDouble, 
  ActivitySquare, 
  Wind, 
  Skull, 
  ArrowUpRight, 
  Sparkles,
  Calendar
} from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

// Robust helper to parse LocalDateTime strings safely across all browser engines
const parseDateSafely = (dateStr) => {
  if (!dateStr) return new Date();
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  try {
    // Attempt standard formatting compatibility: YYYY/MM/DD HH:mm:ss
    const cleanStr = dateStr.split('.')[0];
    const formatted = cleanStr.replace(/-/g, '/').replace('T', ' ');
    d = new Date(formatted);
    if (!isNaN(d.getTime())) return d;
    
    // Explicit manual parsing fallback
    const parts = dateStr.split('T');
    if (parts.length === 2) {
      const dateParts = parts[0].split('-');
      const timeParts = parts[1].split('.')[0].split(':');
      if (dateParts.length === 3 && timeParts.length >= 2) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);
        const second = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
        return new Date(year, month, day, hour, minute, second);
      }
    }
  } catch (e) {
    console.error("Failed to parse date safely:", dateStr, e);
  }
  return new Date();
};

const Dashboard = () => {
  const { authFetch } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await authFetch('http://localhost:8080/api/analytics/summary');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
      <div className="alert alert-danger border-0 glass-panel m-3 p-4 text-center" role="alert">
        <h4 className="alert-heading font-title">Error Loading Dashboard</h4>
        <p className="mb-0 text-secondary">{error}</p>
        <button onClick={fetchAnalytics} className="btn btn-premium-primary mt-3">Try Again</button>
      </div>
    );
  }

  const { predictionCount, averageStressLevel, recentPredictions } = analytics || {
    predictionCount: 0,
    averageStressLevel: 0,
    recentPredictions: []
  };

  // Get latest prediction logs
  const latestLog = recentPredictions.length > 0 ? recentPredictions[0] : null;

  // Determine stress level details
  const getStressInfo = (level) => {
    const val = Math.round(level);
    if (val === 0) return { label: 'Low', color: 'var(--stress-low)', textClass: 'text-success', desc: 'Minimal stress detected. Keep doing what you are doing!', icon: <Smile size={48} className="text-success" /> };
    if (val === 1) return { label: 'Medium', color: 'var(--stress-med)', textClass: 'text-warning', desc: 'Mild or moderate stress indicators present. Consider adjusting workload and practicing mindfulness.', icon: <Flame size={48} className="text-warning" /> };
    return { label: 'High', color: 'var(--stress-high)', textClass: 'text-danger', desc: 'Critical stress levels detected. Prioritize immediate rest, sleep hygiene, and professional counseling.', icon: <Frown size={48} className="text-danger" /> };
  };

  const stressInfo = getStressInfo(latestLog ? latestLog.predictedStressLevel : averageStressLevel);

  // Recommendations generator
  const getRecommendations = (level, log) => {
    if (!log) return ["Take your first early stress prediction survey to get customized lifestyle recommendations!"];
    
    const recs = [];
    const lvl = log.predictedStressLevel;
    
    // Add advice based on stress levels
    if (lvl === 0) {
      recs.push("Your physical vitals look excellent. Maintain a consistent routine.");
      recs.push("Continue incorporating 15-30 minutes of cardiovascular exercises daily.");
    } else if (lvl === 1) {
      recs.push("Practicing 4-7-8 breathing exercises can reduce stress immediately.");
      if (log.sleepQuality < 3) recs.push("Prioritize a sleep schedule: Sleep at the same time and avoid screens 1 hour before bed.");
      if (log.studyLoad > 3) recs.push("Break your work down. Use time management frameworks like Pomodoro to manage workloads.");
    } else {
      recs.push("Urgent: Limit your workload and reschedule non-immediate commitments.");
      if (log.breathingProblem > 2) recs.push("Check breathing rhythm. Regular cardio or simple walks in nature will improve respiration quality.");
      if (log.headache > 3) recs.push("Ensure you stay hydrated (2-3L water) and monitor headache triggers.");
      if (log.sleepQuality < 2) recs.push("Consider speaking with a doctor regarding chronic fatigue and sleep problems.");
    }
    
    // Feature-specific recommendations
    if (log.anxietyLevel > 14) recs.push("Consider cognitive behavioral therapy (CBT) exercises to regulate anxiety.");
    if (log.bullying > 2) recs.push("Report any occurrences of harassment or bullying to local campus/work authorities.");
    if (log.socialSupport < 3) recs.push("Connect with friends or family; social support buffers heavy stress.");
    
    return recs;
  };

  const recommendations = getRecommendations(latestLog ? latestLog.predictedStressLevel : 0, latestLog);

  // Chart data setup
  const chartData = {
    labels: [...recentPredictions].reverse().map(p => parseDateSafely(p.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})),
    datasets: [
      {
        label: 'Predicted Stress Level',
        data: [...recentPredictions].reverse().map(p => p.predictedStressLevel),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 7,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 2,
        ticks: {
          stepSize: 1,
          callback: (value) => value === 0 ? 'Low' : (value === 1 ? 'Med' : 'High'),
          color: '#94a3b8',
          font: { family: 'Outfit' }
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            return `Stress Level: ${val === 0 ? 'Low' : (val === 1 ? 'Medium' : 'High')}`;
          }
        }
      }
    }
  };

  return (
    <div className="container-fluid py-2 animate-fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-extrabold mb-1">My Dashboard</h1>
          <p className="text-secondary small mb-0">Overview of early physiological stress indicators</p>
        </div>
        <Link to="/predict" className="btn btn-premium-primary d-flex align-items-center gap-2">
          <span>New Assessment</span>
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="row g-4">
        {/* Quick status card */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-secondary small fw-bold font-title uppercase">Current Status</span>
                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: `${stressInfo.color}15`, color: stressInfo.color, border: `1px solid ${stressInfo.color}30` }}>
                  {stressInfo.label} Stress
                </span>
              </div>
              <div className="d-flex align-items-center gap-3 my-4">
                {stressInfo.icon}
                <div>
                  <h2 className="mb-0 fw-bold font-title">{stressInfo.label}</h2>
                  <span className="text-secondary small">Latest calculated level</span>
                </div>
              </div>
              <p className="text-secondary mb-0">{stressInfo.desc}</p>
            </div>
            
            <div className="border-top border-secondary mt-4 pt-3" style={{ borderOpacity: 0.1 }}>
              <div className="d-flex justify-content-between">
                <span className="text-secondary small">Assessments Completed:</span>
                <span className="fw-bold">{predictionCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Physical factors monitoring */}
        <div className="col-lg-8">
          <div className="glass-panel p-4 h-100">
            <h5 className="font-title mb-3 d-flex align-items-center gap-2">
              <ActivitySquare size={20} className="text-primary" style={{ color: 'var(--accent-blue)' }} />
              <span>Key Early Physiological Indicators</span>
            </h5>
            <p className="text-secondary small mb-4">Latest measurements (scale 0-5, Blood Pressure 1-3)</p>
            
            {latestLog ? (
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <div className="glass-panel p-3 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <BedDouble size={24} className="mb-2" style={{ color: 'var(--accent-blue)' }} />
                    <span className="d-block text-secondary small">Sleep Quality</span>
                    <h3 className="mb-1 mt-2 fw-bold font-title">{latestLog.sleepQuality}/5</h3>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>{latestLog.sleepQuality >= 4 ? 'Good' : (latestLog.sleepQuality >= 2.5 ? 'Moderate' : 'Poor')}</small>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="glass-panel p-3 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <Skull size={24} className="mb-2" style={{ color: 'var(--accent-pink)' }} />
                    <span className="d-block text-secondary small">Headaches</span>
                    <h3 className="mb-1 mt-2 fw-bold font-title">{latestLog.headache}/5</h3>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>{latestLog.headache >= 4 ? 'Severe' : (latestLog.headache >= 2 ? 'Frequent' : 'None/Rare')}</small>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="glass-panel p-3 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <Activity size={24} className="mb-2" style={{ color: 'var(--accent-purple)' }} />
                    <span className="d-block text-secondary small">Blood Pressure</span>
                    <h3 className="mb-1 mt-2 fw-bold font-title">{latestLog.bloodPressure}/3</h3>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>{latestLog.bloodPressure === 1 ? 'Normal' : (latestLog.bloodPressure === 2 ? 'Medium' : 'High')}</small>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="glass-panel p-3 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <Wind size={24} className="mb-2 text-info" />
                    <span className="d-block text-secondary small">Breathing Issues</span>
                    <h3 className="mb-1 mt-2 fw-bold font-title">{latestLog.breathingProblem}/5</h3>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>{latestLog.breathingProblem >= 4 ? 'Severe' : (latestLog.breathingProblem >= 2 ? 'Frequent' : 'None')}</small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-5">
                <p className="text-secondary mb-0">No assessment data available yet.</p>
                <Link to="/predict" className="btn btn-premium-secondary mt-3">Run Assessment</Link>
              </div>
            )}
          </div>
        </div>

        {/* History Chart */}
        <div className="col-md-8">
          <div className="glass-panel p-4" style={{ height: '380px' }}>
            <h5 className="font-title mb-4 d-flex align-items-center gap-2">
              <Calendar size={20} className="text-purple" style={{ color: 'var(--accent-purple)' }} />
              <span>Stress Timeline Trend</span>
            </h5>
            {recentPredictions.length > 0 ? (
              <div style={{ height: '270px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-75 d-flex justify-content-center align-items-center">
                <p className="text-secondary">Take assessment tests to plot your timeline.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="col-md-4">
          <div className="glass-panel p-4" style={{ minHeight: '380px' }}>
            <h5 className="font-title mb-4 d-flex align-items-center gap-2">
              <Sparkles size={20} className="text-warning" />
              <span>AI Stress Reliever Advice</span>
            </h5>
            <div className="d-flex flex-column gap-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--accent-purple)' }}>
                  <div className="small fw-semibold">{rec}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
