import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import RegistrationForm from './pages/Auth/RegistrationForm';
import LoginPage from './pages/Auth/LoginPage';
import FranchiseSignUpPage from './pages/Auth/FranchiseSignUpPage';
import ConfirmSignUpPage   from './pages/Auth/ConfirmSignUpPage';
import ChatTestPage from './pages/Chat/ChatTestPage';

function App() {
  return (
    <Router>
       <Routes>
        {/* Registration */}
        <Route path="/Auth/RegistrationPage" element={<RegistrationForm/>} />
        <Route path="/Auth/confirm"  element={<ConfirmSignUpPage />} />
        <Route path="/" element={<LoginPage/>} />

        {/* Login (MFA flow) */}
        <Route path="/Auth/LoginPage" element={<LoginPage/>} />
        


        {/* Fallback: redirect unknown URLs to sign-up */}
        {/* <Route path="*"               element={<Navigate to="/Auth/RegistrationPage" replace />} /> */}

       
         {/* Franchise auth */}
         <Route path="/Auth/FranchiseSignUpPage" element={<FranchiseSignUpPage />} />
         {/* Chat Test Page */}
         <Route path="/chat-test" element={<ChatTestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
