import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';

// Enhanced Session management utilities
class SessionManager {
  private static SESSION_KEY = 'user_session';
  private static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static sessionTimer: number | null = null;

  // Use sessionStorage instead of localStorage - clears when tab closes
  static setSession(token: string, userData: any) {
    const sessionData = {
      token,
      userData,
      timestamp: Date.now()
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    this.resetSessionTimer();
  }

  static getSession() {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const parsed = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check if session is expired (30 minutes)
      if (now - parsed.timestamp > this.SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch {
      this.clearSession();
      return null;
    }
  }

  static clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  static resetSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      this.clearSession();
      // Force redirect to login when session expires
      window.location.href = '/login';
    }, this.SESSION_TIMEOUT);
  }

  static extendSession() {
    const session = this.getSession();
    if (session) {
      session.timestamp = Date.now();
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      this.resetSessionTimer();
      return true;
    }
    return false;
  }

  // Check if current session is valid
  static isValidSession(): boolean {
    const session = this.getSession();
    return session !== null && session.token && session.userData;
  }

  // Force logout and redirect to login
  static forceLogout() {
    this.clearSession();
    window.location.href = '/login';
  }
}

// Global session validation function
export const validateSession = (): boolean => {
  if (!SessionManager.isValidSession()) {
    SessionManager.forceLogout();
    return false;
  }
  return true;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const activityTimer = useRef<number | null>(null);

  // Activity tracking for auto-logout
  const resetActivityTimer = React.useCallback(() => {
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }
    
    if (isAuthenticated) {
      // Extend session on activity
      const sessionExtended = SessionManager.extendSession();
      if (!sessionExtended) {
        // If session can't be extended, logout
        handleLogout();
        return;
      }
      
      // Auto-logout after 30 minutes of inactivity
      activityTimer.current = setTimeout(() => {
        handleLogout();
      }, 30 * 60 * 1000);
    }
  }, [isAuthenticated]);

  // Handle logout - always redirect to login
  const handleLogout = React.useCallback(() => {
    SessionManager.clearSession();
    setIsAuthenticated(false);
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }
    // Always redirect to login instead of register
    window.location.href = '/login';
  }, []);

  // Check session on app load
  useEffect(() => {
    const session = SessionManager.getSession();
    if (session && SessionManager.isValidSession()) {
      setIsAuthenticated(true);
      SessionManager.resetSessionTimer();
    } else {
      // Clear any invalid session data
      SessionManager.clearSession();
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  // Set up activity tracking
  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const resetTimer = () => resetActivityTimer();
      
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      resetActivityTimer();

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
        if (activityTimer.current) {
          clearTimeout(activityTimer.current);
        }
      };
    }
  }, [isAuthenticated, resetActivityTimer]);

  // Clear session when tab/window closes or navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      SessionManager.clearSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isAuthenticated) {
        // User switched tabs or minimized - start aggressive timeout
        setTimeout(() => {
          if (document.hidden) {
            SessionManager.clearSession();
            setIsAuthenticated(false);
          }
        }, 5 * 60 * 1000); // 5 minutes when tab is hidden
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const handleLogin = (token: string, userData: any) => {
    SessionManager.setSession(token, userData);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Registration onRegister={handleLogin} />
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          {/* Default route - redirect unauthenticated users to login instead of register */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> :
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;