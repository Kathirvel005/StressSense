import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Smile, 
  TreePine, 
  GraduationCap, 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Brain,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Predictor = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Form State initialized to average/healthy defaults
  const [formData, setFormData] = useState({
    // Step 1: Physiological (Physical Matters)
    headache: 1,
    blood_pressure: 1,
    sleep_quality: 4,
    breathing_problem: 0,

    // Step 2: Psychological
    anxiety_level: 5,
    self_esteem: 22,
    mental_health_history: 0,
    depression: 5,

    // Step 3: Environmental
    noise_level: 1,
    living_conditions: 4,
    safety: 4,
    basic_needs: 4,

    // Step 4: Academic
    academic_performance: 4,
    study_load: 2,
    teacher_student_relationship: 4,
    future_career_concerns: 2,

    // Step 5: Social
    social_support: 4,
    peer_pressure: 2,
    extracurricular_activities: 3,
    bullying: 0
  });

  const updateField = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(val)
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authFetch('http://localhost:8080/api/predictions/predict', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to submit prediction');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to map stress level integers to visual objects
  const getResultDetails = (level) => {
    if (level === 0) return { label: 'Low Stress', color: '#10b981', desc: 'You are in a healthy, well-balanced mental space. Keep up your active routine and rest cycles.', bg: 'rgba(16, 185, 129, 0.1)' };
    if (level === 1) return { label: 'Medium Stress', color: '#f59e0b', desc: 'You are experiencing moderate pressure. Make sure to schedule short breaks, organize tasks, and regulate sleep.', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'High Stress', color: '#ef4444', desc: 'Critical stress levels detected. We highly recommend talking to family, advisors, or consulting professional counseling services.', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const stepsDetails = [
    { number: 1, title: 'Physiological (Physical)', icon: <HeartPulse size={20} /> },
    { number: 2, title: 'Psychological', icon: <Smile size={20} /> },
    { number: 3, title: 'Environmental', icon: <TreePine size={20} /> },
    { number: 4, title: 'Academic', icon: <GraduationCap size={20} /> },
    { number: 5, title: 'Social Factors', icon: <Users size={20} /> }
  ];

  if (result) {
    const details = getResultDetails(result.stress_level);
    return (
      <div className="d-flex justify-content-center align-items-center flex-grow-1 py-4 animate-fade-in">
        <div className="glass-panel p-5 text-center" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="d-inline-flex p-3 rounded-circle mb-4" style={{ backgroundColor: details.bg, color: details.color }}>
            <Brain size={48} />
          </div>
          <h2 className="font-title fw-bold mb-1">Early Prediction Result</h2>
          <h1 className="display-4 fw-extrabold mb-3" style={{ color: details.color }}>{details.label}</h1>
          
          <div className="mb-4">
            <span className="text-secondary small d-block">Prediction Confidence</span>
            <span className="h4 fw-bold font-title text-white">{Math.round(result.confidence * 100)}%</span>
          </div>

          <p className="text-secondary mb-4 px-3">{details.desc}</p>

          {/* Top Contributing Factors */}
          {result.top_contributors && result.top_contributors.length > 0 && (
            <div className="text-start glass-panel p-4 mb-4" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <h6 className="font-title mb-3 d-flex align-items-center gap-2">
                <TrendingUp size={16} className="text-purple" style={{ color: 'var(--accent-purple)' }} />
                <span>Primary Risk Factors (Contributions)</span>
              </h6>
              <div className="d-flex flex-column gap-2">
                {result.top_contributors.map((contrib, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center small py-1">
                    <span className="text-secondary text-capitalize">{contrib.feature.replace(/_/g, ' ')}</span>
                    <span className="fw-bold">Value: {contrib.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="d-flex gap-3 justify-content-center">
            <button onClick={() => setResult(null)} className="btn btn-premium-secondary px-4 py-2">
              Retake Test
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-premium-primary px-4 py-2">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-2 animate-fade-in flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <div className="glass-panel p-5 w-100" style={{ maxWidth: '720px' }}>
        <h2 className="font-title text-gradient-purple mb-1">Early Stress Assessment</h2>
        <p className="text-secondary small mb-4">Complete the physical & cognitive health parameters below</p>

        {error && (
          <div className="alert alert-danger border-0 d-flex align-items-center gap-2 p-3 mb-4 rounded-3" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
            <AlertCircle size={18} />
            <span className="small fw-semibold">{error}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="d-flex justify-content-between mb-5 flex-wrap gap-2">
          {stepsDetails.map((s, idx) => (
            <div 
              key={idx} 
              className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 small fw-semibold font-title ${step === s.number ? 'bg-primary text-white' : 'text-secondary'}`}
              style={step === s.number ? { background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)', boxShadow: '0 4px 10px rgba(239,68,68,0.2)' } : { background: 'rgba(255,255,255,0.02)' }}
            >
              {s.icon}
              <span className="d-none d-md-inline">{s.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Physiological (Physical Factors) */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h4 className="font-title mb-4 text-white d-flex align-items-center gap-2">
                <HeartPulse className="text-danger" />
                <span>Physiological & Physical Health</span>
              </h4>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Headache Frequency (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.headache}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.headache} 
                  onChange={(e) => updateField('headache', e.target.value)} 
                />
                <div className="d-flex justify-content-between small text-secondary mt-1">
                  <span>None</span>
                  <span>Moderate</span>
                  <span>Severe / Constant</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold font-title mb-2">Blood Pressure Level</label>
                <div className="d-flex gap-3">
                  {[1, 2, 3].map(level => (
                    <label 
                      key={level} 
                      className={`flex-fill p-3 rounded-3 border text-center cursor-pointer transition-all ${formData.blood_pressure === level ? 'border-primary' : 'border-secondary'}`}
                      style={formData.blood_pressure === level ? { background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(59,130,246,0.1) 100%)', borderColor: 'var(--accent-purple) !important' } : { background: 'rgba(255,255,255,0.02)', borderColor: 'var(--glass-border) !important', opacity: 0.7 }}
                    >
                      <input 
                        type="radio" 
                        name="bp" 
                        className="d-none" 
                        value={level} 
                        checked={formData.blood_pressure === level} 
                        onChange={() => updateField('blood_pressure', level)} 
                      />
                      <span className="d-block fw-bold font-title text-white">
                        {level === 1 ? 'Normal' : (level === 2 ? 'Medium' : 'High')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Sleep Quality (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.sleep_quality}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.sleep_quality} 
                  onChange={(e) => updateField('sleep_quality', e.target.value)} 
                />
                <div className="d-flex justify-content-between small text-secondary mt-1">
                  <span>Insomnia / Poor</span>
                  <span>Moderate</span>
                  <span>Restful / Excellent</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Breathing Problem Frequency (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.breathing_problem}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.breathing_problem} 
                  onChange={(e) => updateField('breathing_problem', e.target.value)} 
                />
                <div className="d-flex justify-content-between small text-secondary mt-1">
                  <span>None</span>
                  <span>Shortness on exertion</span>
                  <span>Frequent / Asthma</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Psychological */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h4 className="font-title mb-4 text-white d-flex align-items-center gap-2">
                <Smile className="text-warning" />
                <span>Psychological Indicators</span>
              </h4>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Anxiety Level (0 - 21)</label>
                  <span className="badge bg-secondary font-title">{formData.anxiety_level}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="21" 
                  value={formData.anxiety_level} 
                  onChange={(e) => updateField('anxiety_level', e.target.value)} 
                />
                <div className="d-flex justify-content-between small text-secondary mt-1">
                  <span>Calm / Normal</span>
                  <span>Moderate</span>
                  <span>Severe / Constant</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Self Esteem (0 - 30)</label>
                  <span className="badge bg-secondary font-title">{formData.self_esteem}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="30" 
                  value={formData.self_esteem} 
                  onChange={(e) => updateField('self_esteem', e.target.value)} 
                />
                <div className="d-flex justify-content-between small text-secondary mt-1">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>High / Positive</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold font-title mb-2">Mental Health History</label>
                <div className="form-check form-switch p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', paddingLeft: '3.5rem' }}>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    checked={formData.mental_health_history === 1}
                    onChange={(e) => updateField('mental_health_history', e.target.checked ? 1 : 0)} 
                  />
                  <label className="form-check-label text-white small fw-semibold font-title">
                    Diagnosed mental health conditions in family/history
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Depression Scale (0 - 27)</label>
                  <span className="badge bg-secondary font-title">{formData.depression}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="27" 
                  value={formData.depression} 
                  onChange={(e) => updateField('depression', e.target.value)} 
                />
                <div className="d-flex justify-content-between small text-secondary mt-1">
                  <span>None</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Environmental */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h4 className="font-title mb-4 text-white d-flex align-items-center gap-2">
                <TreePine className="text-success" />
                <span>Environmental & Living Conditions</span>
              </h4>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Noise Level (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.noise_level}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.noise_level} 
                  onChange={(e) => updateField('noise_level', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Living Conditions quality (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.living_conditions}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.living_conditions} 
                  onChange={(e) => updateField('living_conditions', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Safety Sentiment (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.safety}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.safety} 
                  onChange={(e) => updateField('safety', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Basic Needs Access (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.basic_needs}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.basic_needs} 
                  onChange={(e) => updateField('basic_needs', e.target.value)} 
                />
              </div>
            </div>
          )}

          {/* Step 4: Academic */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h4 className="font-title mb-4 text-white d-flex align-items-center gap-2">
                <GraduationCap className="text-info" />
                <span>Academic & Work Factors</span>
              </h4>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Academic Performance (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.academic_performance}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.academic_performance} 
                  onChange={(e) => updateField('academic_performance', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Study / Work Load (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.study_load}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.study_load} 
                  onChange={(e) => updateField('study_load', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Teacher / Advisor Relationship (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.teacher_student_relationship}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.teacher_student_relationship} 
                  onChange={(e) => updateField('teacher_student_relationship', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Future Career Concerns (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.future_career_concerns}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.future_career_concerns} 
                  onChange={(e) => updateField('future_career_concerns', e.target.value)} 
                />
              </div>
            </div>
          )}

          {/* Step 5: Social */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h4 className="font-title mb-4 text-white d-flex align-items-center gap-2">
                <Users className="text-purple" style={{ color: 'var(--accent-purple)' }} />
                <span>Social & Interpersonal Factors</span>
              </h4>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Social Support (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.social_support}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.social_support} 
                  onChange={(e) => updateField('social_support', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Peer Pressure (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.peer_pressure}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.peer_pressure} 
                  onChange={(e) => updateField('peer_pressure', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Extracurricular Activities engagement (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.extracurricular_activities}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.extracurricular_activities} 
                  onChange={(e) => updateField('extracurricular_activities', e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <label className="form-label text-secondary small fw-bold font-title">Bullying Experience (0 - 5)</label>
                  <span className="badge bg-secondary font-title">{formData.bullying}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-premium" 
                  min="0" max="5" 
                  value={formData.bullying} 
                  onChange={(e) => updateField('bullying', e.target.value)} 
                />
              </div>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="d-flex justify-content-between mt-5">
            {step > 1 ? (
              <button type="button" onClick={handlePrev} className="btn btn-premium-secondary d-flex align-items-center gap-2">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button type="button" onClick={handleNext} className="btn btn-premium-primary d-flex align-items-center gap-2">
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-premium-primary d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Predictor;
