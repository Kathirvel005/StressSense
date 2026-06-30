import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    try {
      return localStorage.getItem('stress_token') === 'mock-jwt-token-demo';
    } catch {
      return false;
    }
  });

  const enableOfflineMode = () => {
    setIsOfflineMode(prev => {
      if (!prev) return true;
      return prev;
    });
  };

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('stress_user');
    const token = localStorage.getItem('stress_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Get/set mock users in localStorage for Demo Mode
  const getMockUsers = () => {
    try {
      const stored = localStorage.getItem('stress_mock_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveMockUser = (newUser) => {
    const users = getMockUsers();
    users.push(newUser);
    localStorage.setItem('stress_mock_users', JSON.stringify(users));
  };

  const mockRegister = (username, email, password, role) => {
    const users = getMockUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists (Demo Mode)');
    }
    const newUser = { id: users.length + 1, username, email, password, role: `ROLE_${role}` };
    saveMockUser(newUser);
    
    const userProfile = { username, email, role: `ROLE_${role}` };
    localStorage.setItem('stress_token', 'mock-jwt-token-demo');
    localStorage.setItem('stress_user', JSON.stringify(userProfile));
    setUser(userProfile);
    enableOfflineMode();
    return userProfile;
  };

  const mockLogin = (username, password) => {
    const users = getMockUsers();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!found) {
      throw new Error('Invalid credentials (Demo Mode)');
    }
    const userProfile = { username: found.username, email: found.email, role: found.role };
    localStorage.setItem('stress_token', 'mock-jwt-token-demo');
    localStorage.setItem('stress_user', JSON.stringify(userProfile));
    setUser(userProfile);
    enableOfflineMode();
    return userProfile;
  };

  const mockAuthFetch = async (url, options = {}) => {
    enableOfflineMode();
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    
    // Simulate slight server latency
    await new Promise(r => setTimeout(r, 600));

    const currentUser = user || JSON.parse(localStorage.getItem('stress_user') || '{}');
    const username = currentUser.username || 'demo_user';

    // 1. Predict Endpoint
    if (path.includes('/api/predictions/predict') && options.method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      
      // Heuristic prediction mimicking the Python Random Forest model
      const anxiety = body.anxiety_level ?? 5;
      const sleep = body.sleep_quality ?? 3;
      const selfEsteem = body.self_esteem ?? 20;
      const depression = body.depression ?? 5;
      const headache = body.headache ?? 1;
      const bullying = body.bullying ?? 0;
      const socialSupport = body.social_support ?? 4;
      const bp = body.blood_pressure ?? 1;
      const breathing = body.breathing_problem ?? 0;
      const study = body.study_load ?? 2;

      // Calculate a stress score
      let score = 0;
      score += anxiety * 0.12;
      score += depression * 0.08;
      score += (5 - sleep) * 0.25;
      score += (30 - selfEsteem) * 0.04;
      score += headache * 0.15;
      score += bullying * 0.25;
      score += (5 - socialSupport) * 0.15;
      score += (bp - 1) * 0.3;

      let stress_level = 0;
      let label = "Low";
      if (score > 1.8) {
        stress_level = 2;
        label = "High";
      } else if (score > 0.8) {
        stress_level = 1;
        label = "Medium";
      }

      // Base probabilities
      let baseLow = 0.85, baseMed = 0.10, baseHigh = 0.05;
      if (stress_level === 1) {
        baseLow = 0.15; baseMed = 0.78; baseHigh = 0.07;
      } else if (stress_level === 2) {
        baseLow = 0.04; baseMed = 0.11; baseHigh = 0.85;
      }
      
      // Contributors mapping
      const contributors = [
        { feature: "anxiety_level", value: anxiety, score: anxiety * 0.12 },
        { feature: "depression", value: depression, score: depression * 0.08 },
        { feature: "sleep_quality", value: sleep, score: (5 - sleep) * 0.25 },
        { feature: "self_esteem", value: selfEsteem, score: (30 - selfEsteem) * 0.04 },
        { feature: "bullying", value: bullying, score: bullying * 0.25 }
      ].sort((a, b) => b.score - a.score);

      const predictionResult = {
        stress_level,
        label,
        confidence: stress_level === 2 ? 0.85 : (stress_level === 1 ? 0.78 : 0.92),
        probabilities: { Low: baseLow, Medium: baseMed, High: baseHigh },
        top_contributors: contributors.slice(0, 5),
        timestamp: new Date().toISOString()
      };

      // Save predictions to localStorage for this specific user
      const historyKey = `stress_history_${username}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newHistoryItem = {
        id: existingHistory.length + 1,
        predictedStressLevel: stress_level,
        confidence: predictionResult.confidence,
        timestamp: predictionResult.timestamp,
        anxietyLevel: anxiety,
        selfEsteem: selfEsteem,
        depression: depression,
        sleepQuality: sleep,
        headache: headache,
        bloodPressure: bp,
        breathingProblem: breathing,
        bullying: bullying,
        socialSupport: socialSupport,
        studyLoad: study
      };
      existingHistory.unshift(newHistoryItem);
      localStorage.setItem(historyKey, JSON.stringify(existingHistory));

      return {
        ok: true,
        status: 200,
        json: async () => predictionResult,
        text: async () => JSON.stringify(predictionResult)
      };
    }

    // 2. Summary Endpoint
    if (path.includes('/api/analytics/summary')) {
      const historyKey = `stress_history_${username}`;
      const predictions = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const average = predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.predictedStressLevel, 0) / predictions.length
        : 0;

      const summary = {
        predictionCount: predictions.length,
        averageStressLevel: average,
        recentPredictions: predictions.slice(0, 10)
      };

      return {
        ok: true,
        status: 200,
        json: async () => summary,
        text: async () => JSON.stringify(summary)
      };
    }

    // 3. Admin Summary Endpoint
    if (path.includes('/api/analytics/admin-summary')) {
      const users = getMockUsers();
      const allHistories = [];
      users.forEach(u => {
        const userHist = JSON.parse(localStorage.getItem(`stress_history_${u.username}`) || '[]');
        allHistories.push(...userHist);
      });

      const dist = { 0: 0, 1: 0, 2: 0 };
      allHistories.forEach(h => {
        dist[h.predictedStressLevel] = (dist[h.predictedStressLevel] || 0) + 1;
      });

      const globalAvg = allHistories.length > 0
        ? allHistories.reduce((sum, h) => sum + h.predictedStressLevel, 0) / allHistories.length
        : 0;

      const adminSummary = {
        stressLevelDistribution: dist,
        globalAverageStressLevel: globalAvg,
        mlMetrics: {
          accuracy: 0.92,
          feature_importances: {
            anxiety_level: 0.28,
            sleep_quality: 0.22,
            depression: 0.18,
            self_esteem: 0.12,
            bullying: 0.08,
            headache: 0.06,
            blood_pressure: 0.04,
            social_support: 0.02
          }
        }
      };

      return {
        ok: true,
        status: 200,
        json: async () => adminSummary,
        text: async () => JSON.stringify(adminSummary)
      };
    }

    // 4. Admin Users Endpoint
    if (path.includes('/api/admin/users')) {
      if (options.method === 'DELETE') {
        const idToDelete = parseInt(path.split('/').pop(), 10);
        const users = getMockUsers();
        const updatedUsers = users.filter(u => u.id !== idToDelete);
        localStorage.setItem('stress_mock_users', JSON.stringify(updatedUsers));
        return {
          ok: true,
          status: 200,
          text: async () => "User deleted"
        };
      }

      // GET
      const users = getMockUsers().map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role }));
      return {
        ok: true,
        status: 200,
        json: async () => users,
        text: async () => JSON.stringify(users)
      };
    }

    return {
      ok: false,
      status: 404,
      text: async () => "Not Found"
    };
  };

  const login = async (username, password) => {
    if (isOfflineMode) {
      return mockLogin(username, password);
    }
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('stress_token', data.token);
      
      const userProfile = {
        username: data.username,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('stress_user', JSON.stringify(userProfile));
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.warn('Backend login failed, falling back to Offline Demo Mode:', error);
      enableOfflineMode();
      
      // Auto-register the user in local mock DB to make demo testing seamless
      const mockUsers = getMockUsers();
      if (!mockUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        saveMockUser({
          id: mockUsers.length + 1,
          username,
          email: `${username}@demo.com`,
          password,
          role: 'ROLE_USER'
        });
      }
      return mockLogin(username, password);
    }
  };

  const register = async (username, email, password, role = 'USER') => {
    if (isOfflineMode) {
      return mockRegister(username, email, password, role);
    }
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('stress_token', data.token);
      
      const userProfile = {
        username: data.username,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('stress_user', JSON.stringify(userProfile));
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.warn('Backend registration failed, falling back to Offline Demo Mode:', error);
      enableOfflineMode();
      return mockRegister(username, email, password, role);
    }
  };

  const logout = () => {
    localStorage.removeItem('stress_token');
    localStorage.removeItem('stress_user');
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    if (isOfflineMode) {
      return mockAuthFetch(url, options);
    }
    try {
      const token = localStorage.getItem('stress_token');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 || response.status === 430) {
        logout();
        throw new Error('Session expired');
      }

      return response;
    } catch (error) {
      console.warn(`Backend request to ${url} failed, falling back to Offline Demo Mode:`, error);
      enableOfflineMode();
      return mockAuthFetch(url, options);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch, isOfflineMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
