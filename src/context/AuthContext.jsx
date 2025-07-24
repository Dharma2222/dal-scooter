// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Create Auth context
const AuthContext = createContext();

// Add prevStep & logout, rehydrate token, memoize contextValue

export const AuthProvider = ({ children }) => {
    const [credentials, setCredentials] = useState({ email:'', password:'', securityAnswer:'', shiftKey:'' });
    const [step, setStep]         = useState(1);
    const [token, setToken]       = useState(() => localStorage.getItem('authToken') || null);
    const [authUser, setAuthUser]       = useState(() => JSON.parse(localStorage.getItem('authUser')) || null);

    const saveCredentials = (data) => setCredentials(prev => ({ ...prev, ...data }));
    const nextStep         = ()    => setStep(s => Math.min(3, s + 1));
    const prevStep         = ()    => setStep(s => Math.max(1, s - 1));
    const completeAuth     = t    => {
      setToken(t.token);
      setAuthUser(t.user);
      localStorage.setItem('authToken', t.token);
      localStorage.setItem('authUser', JSON.stringify(t.user));

    };
    const logout           = ()    => {
      setToken(null);
      setAuthUser(null);

      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      setStep(1);
      setCredentials({ email:'', password:'', securityAnswer:'', shiftKey:'' });
    };
  
    const isAuthenticated = Boolean(token);
  
    const contextValue = React.useMemo(() => ({
      credentials, step, isAuthenticated,
      saveCredentials, nextStep, prevStep, completeAuth, logout,authUser
    }), [credentials, step, isAuthenticated]);
  
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };
  

export const useAuth = () => useContext(AuthContext);
