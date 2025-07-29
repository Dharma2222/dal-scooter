import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import DALScooterChatBubble from "../../components/DALScooterChatBubble";

export default function UserDashboardPage() {
  const { authUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">
            Hi, {authUser?.name || authUser?.email || "User"}
          </h2>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/user/booking"
                className={({ isActive }) =>
                  "block px-6 py-3 transition " +
                  (isActive
                    ? "bg-green-100 font-semibold"
                    : "hover:bg-gray-200")
                }
              >
                Book Scooter
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/history"
                className={({ isActive }) =>
                  "block px-6 py-3 transition " +
                  (isActive
                    ? "bg-green-100 font-semibold"
                    : "hover:bg-gray-200")
                }
              >
                My Booking History
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <DALScooterChatBubble />
    </div>
  );
}
