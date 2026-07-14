import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// DEMO CREDENTIALS — for LinkedIn portfolio viewing
// These are intentionally hardcoded for showcase purposes only.
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_USERS = {
  '9999999999': {
    passcode: '1234',
    uid: 'demo-donor-001',
    phone: '+91 99999 99999',
    role: 'donor',
    name: 'Rahul Sharma',
    organisation_name: 'VESIT Main Canteen',
    coordinates: { lat: 19.0443, lng: 72.8891 },
    registered_at: '2026-01-01T00:00:00.000Z',
  },
  '8888888888': {
    passcode: '1234',
    uid: 'demo-ngo-001',
    phone: '+91 88888 88888',
    role: 'ngo',
    name: 'Priya Mehta',
    organisation_name: 'Green Earth Foundation',
    coordinates: { lat: 19.0480, lng: 72.8850 },
    registered_at: '2026-01-01T00:00:00.000Z',
  },
};

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_demo_user');
      if (saved) {
        setUserData(JSON.parse(saved));
      }
    } catch (e) {
      localStorage.removeItem('cc_demo_user');
    }
    setLoading(false);
  }, []);

  /**
   * Demo login — checks against hardcoded credentials.
   * Returns { success, role } or { success: false, error }
   */
  const login = (phone, passcode) => {
    const demo = DEMO_USERS[phone];
    if (!demo || demo.passcode !== passcode) {
      return {
        success: false,
        error: 'Invalid demo credentials. Use phone 9999999999 (Donor) or 8888888888 (NGO) with passcode 1234.',
      };
    }
    const { passcode: _omit, ...userInfo } = demo;
    setUserData(userInfo);
    localStorage.setItem('cc_demo_user', JSON.stringify(userInfo));
    return { success: true, role: userInfo.role };
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem('cc_demo_user');
    localStorage.removeItem('selectedRole');
  };

  /**
   * Writes user data to Firestore (so reports/impact APIs work correctly)
   * and updates local state.
   */
  const registerUser = async (uid, data) => {
    try {
      await setDoc(doc(db, 'users', uid), data);
    } catch (e) {
      console.warn('[Demo] Firestore write skipped:', e.message);
    }
    const updated = { ...data };
    setUserData(updated);
    localStorage.setItem('cc_demo_user', JSON.stringify(updated));
  };

  const value = {
    currentUser: userData,
    userData,
    loading,
    login,
    logout,
    registerUser,
    // Backwards-compatible aliases used throughout the app
    user: userData,
    setUser: (u) => {
      setUserData(u);
      if (u) localStorage.setItem('cc_demo_user', JSON.stringify(u));
      else { localStorage.removeItem('cc_demo_user'); localStorage.removeItem('selectedRole'); }
    },
    // Legacy stubs — kept so no other file needs changes
    setupRecaptcha: () => {},
    sendOtp: async () => ({ success: false, error: 'Demo mode: use passcode login.' }),
    verifyOtp: async () => ({ success: false, error: 'Demo mode: use passcode login.' }),
    requestFcmToken: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
