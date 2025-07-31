// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import FeedbackPage from './pages/user/FeedbackPage';



// Route guards
import PublicRoutes    from './routes/PublicRoutes';
import ProtectedRoutes from './routes/ProtectedRoutes';

// Auth pages (all under src/pages/auth/)
import RegistrationForm     from './pages/Auth/RegistrationForm';
import ConfirmSignUpPage    from './pages/Auth/ConfirmSignUpPage';
import LoginPage            from './pages/Auth/LoginPage';
import FranchiseSignUpPage  from './pages/Auth/FranchiseSignUpPage';

// User dashboard + nested pages (src/pages/user/)
import UserDashboardPage    from './pages/user/dashboard';
import BookingPage          from './pages/user/BookingPage';
import BookingHistoryPage   from './pages/user/BookingHistoryPage';


// Partner dashboard + nested pages (src/pages/partner/)
import PartnerDashboardPage from './pages/partner/PartnerDashboard';
import CreateScooterForm    from './pages/partner/CreateScooterForm';
import ScooterHistoryPage   from './pages/partner/ScooterHistoryPage';
import ScooterHistoryListPage from './pages/partner/ScooterHistoryListPage';
import PartnerAnalyticsPage from './pages/partner/PartnerAnalyticsPage';


import ConcernForm from './pages/ConcernForm'; 
import PartnerOutlet from './pages/partner/PartnerOutlet';
import FeedbackTablePage from './pages/partner/FeedbackTablePage';
import LandingPage from './pages/LandingPage';

function App() {
  // This fixes the missing marker icon issue in React apps
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

  return (
    <Router>
      
      <Routes>


        {/* PUBLIC: only for non-authenticated users */}
          <Route path="/auth/register"           element={<RegistrationForm />} />
          <Route path="/auth/confirm"            element={<ConfirmSignUpPage />} />
          <Route path="/auth/login"              element={<LoginPage />} />
          <Route path="/auth/franchise-signup"   element={<FranchiseSignUpPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />

          <Route path="/concerns" element={<ConcernForm />} />

        {/* PROTECTED: only for authenticated users */}
        <Route element={<ProtectedRoutes />}>

          {/* User Dashboard */}
          <Route path="/user" element={<UserDashboardPage />}>
           
            <Route index               element={<Navigate to="booking" replace />} />
            <Route path="booking"      element={<BookingPage />} />
            <Route path="history"      element={<BookingHistoryPage />} />
            <Route path="feedback" element={<FeedbackPage />} />

          </Route>

          {/* Partner Dashboard */}
          <Route path="/partner"  element={<PartnerOutlet />}>
            <Route index                               element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"                     element={<PartnerDashboardPage />} />
            <Route path="scooters/:scooterId/history"  element={<ScooterHistoryPage />} />
            <Route path="scooters/history" element={<ScooterHistoryListPage />} />
            <Route path="analytics"                   element={<PartnerAnalyticsPage />} />
            <Route path="feedback-table" element={<FeedbackTablePage />} />
          </Route>

        </Route>

        {/* Catch-all: redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/"      element={<LandingPage />} />

      </Routes>
    </Router>
  );
}

export default App;
