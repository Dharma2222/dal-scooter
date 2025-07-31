import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Home,
  Bike,
  Clock,
  Users,
  Plus,
  FileText,
  Zap,
  BarChart3,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

const menuConfig = {
  guest: [
    { to: '/', icon: <Home size={18} />, label: 'Home' },
    { to: '/auth/login', icon: <Users size={18} />, label: 'Login' },
    { to: '/auth/register', icon: <Plus size={18} />, label: 'Register' }
  ],
  user: [
    { to: '/user/booking', icon: <Bike size={18} />, label: 'Book Scooter' },
    { to: '/user/history', icon: <Clock size={18} />, label: 'My Booking History' },
    { to: '/user/feedback',icon:<MessageSquare size={18}/>,label:'Feedbacks' }
  ],
  partner: [
    { to: '/partner/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    {
      to: '/partner/scooters/history',
      icon: <FileText size={18} />,
      label: 'Scooter History'
    },
    { to: '/partner/feedback-table', icon: <FileText size={18} />, label: 'View Feedback' },
    { to: '/partner/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' }
  ]
};

export default function Sidebar() {
  const { isAuthenticated, authUser, logout } = useAuth();
  const navigate = useNavigate();

  const role = authUser?.role === 'partner' || authUser?.role === 'Franchise'
    ? 'partner'
    : authUser?.role === 'user' || authUser?.role === 'Client'
      ? 'user'
      : 'guest';

  const menu = menuConfig[role] || menuConfig.guest;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'partner':
        return 'Partner';
      case 'user':
        return 'Customer';
      default:
        return 'Guest';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'partner':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">DALScooter</h2>
            <p className="text-sm text-gray-500">Management Platform</p>
          </div>
        </div>
      </div>

      {/* User Section */}
      {isAuthenticated && authUser && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <span className="text-sm font-semibold text-blue-700">
                {authUser.name?.[0]?.toUpperCase() || authUser.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {authUser.name || authUser.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}>
                  {getRoleDisplayName(role)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menu.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={16} className="text-blue-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer - Logout */}
      {isAuthenticated && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <LogOut size={18} className="flex-shrink-0 text-gray-400 group-hover:text-red-600" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Version Info */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          <p>DALScooter Platform</p>
          <p>Version 2.0</p>
        </div>
      </div>
    </aside>
  );
}