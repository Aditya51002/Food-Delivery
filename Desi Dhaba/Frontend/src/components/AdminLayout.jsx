import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiShoppingBag,
  FiList,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdRestaurantMenu, MdOutlineRiceBowl } from "react-icons/md";
import { useState } from "react";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
    { to: "/admin/foods", label: "Food Items", icon: <FiList size={18} /> },
    { to: "/admin/restaurants", label: "Restaurants", icon: <MdRestaurantMenu size={18} /> },
    { to: "/admin/orders", label: "Orders", icon: <FiShoppingBag size={18} /> },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex h-screen bg-zinc-950">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-white/5 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-br from-rose-500 to-amber-500 p-1.5 rounded-lg shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <MdOutlineRiceBowl size={18} className="text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">Admin</span>
          </div>
          <button className="md:hidden text-zinc-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
          <div className="text-xs text-zinc-500 mb-3 px-4 font-bold uppercase tracking-widest truncate">{user?.name}</div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-zinc-400 hover:text-red-400 px-4 py-2.5 w-full rounded-xl hover:bg-red-500/10 transition text-sm font-medium"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="glass-panel h-16 flex items-center px-6 border-b border-white/5 flex-shrink-0">
          <button className="md:hidden mr-4 text-zinc-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="text-base font-bold text-white tracking-tight">Desi Dhaba Command Center</h1>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
