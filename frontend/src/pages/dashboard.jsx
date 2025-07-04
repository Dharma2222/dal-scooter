// src/pages/dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import ChatBubble from '../../components/ChatBubble';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Dashboard</h1>
        <p className="text-lg text-gray-600 mb-6">Welcome back, <span className="font-medium text-gray-900">{user?.email || 'User'}</span>!</p>

        <div className="flex space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
      <ChatBubble />
    </div>
  );
};

export default Dashboard;
