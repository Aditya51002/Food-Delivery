import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX,
  FiSettings, FiPackage, FiChevronDown, FiSearch,
} from "react-icons/fi";
import { MdOutlineRiceBowl } from "react-icons/md";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLink = "hover:text-orange-200 transition font-medium text-sm";

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl">
              <MdOutlineRiceBowl size={22} className="text-yellow-300" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">Desi Dhaba</span>
              <span className="hidden sm:block text-[10px] text-orange-200 -mt-1 font-medium tracking-wider">
                AUTHENTIC INDIAN CUISINE
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-5">
            <Link to="/" className={navLink}>Home</Link>

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:text-orange-200 transition p-1"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>
              {searchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-9 bg-white rounded-xl shadow-xl overflow-hidden w-72 flex"
                >
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants or food..."
                    className="flex-1 px-4 py-2.5 text-gray-800 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 px-4 text-white hover:bg-orange-700 transition"
                  >
                    <FiSearch size={16} />
                  </button>
                </form>
              )}
            </div>

            {user ? (
              <>
                <Link to="/orders" className={navLink + " flex items-center space-x-1"}>
                  <FiPackage size={15} />
                  <span>Orders</span>
                </Link>
                <Link to="/cart" className="relative hover:text-orange-200 transition">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-orange-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative ml-1">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-yellow-400 text-orange-900 flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                    <FiChevronDown
                      size={14}
                      className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-2xl border border-gray-100 w-56 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm"
                      >
                        <FiUser size={15} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm"
                      >
                        <FiPackage size={15} />
                        <span>My Orders</span>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition text-sm w-full"
                        >
                          <FiLogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="bg-white text-orange-600 px-4 py-1.5 rounded-xl font-semibold text-sm hover:bg-orange-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-white/60 px-4 py-1.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              to="/admin/login"
              className="flex items-center space-x-1 text-xs bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-lg transition"
            >
              <FiSettings size={12} />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center space-x-3">
            {user && (
              <Link to="/cart" className="relative">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-orange-900 text-[10px] font-bold rounded-full w-4.5 h-4.5 w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-orange-500/40 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex mb-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants or food..."
                className="flex-1 px-3 py-2 rounded-l-lg text-gray-800 text-sm outline-none"
              />
              <button type="submit" className="bg-orange-800 px-3 rounded-r-lg hover:bg-orange-900">
                <FiSearch size={16} />
              </button>
            </form>

            <Link to="/" className="flex items-center space-x-2 py-2.5 px-2 rounded-lg hover:bg-white/10">
              <span>Home</span>
            </Link>
            {user ? (
              <>
                <div className="px-2 py-1.5 text-orange-200 text-xs font-semibold tracking-wide border-b border-orange-500/40">
                  Hi, {user.name} 👋
                </div>
                <Link to="/profile" className="block py-2.5 px-2 rounded-lg hover:bg-white/10">My Profile</Link>
                <Link to="/orders" className="block py-2.5 px-2 rounded-lg hover:bg-white/10">My Orders</Link>
                <Link to="/cart" className="block py-2.5 px-2 rounded-lg hover:bg-white/10">
                  Cart {cartCount > 0 && <span className="ml-1 bg-yellow-400 text-orange-900 text-xs px-1.5 py-0.5 rounded-full font-bold">{cartCount}</span>}
                </Link>
                <button onClick={handleLogout} className="block py-2.5 px-2 rounded-lg hover:bg-white/10 text-left text-red-300 w-full">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2.5 px-2 rounded-lg hover:bg-white/10">Login</Link>
                <Link to="/register" className="block py-2.5 px-2 rounded-lg hover:bg-white/10">Register</Link>
              </>
            )}
            <Link to="/admin/login" className="flex items-center space-x-1.5 py-2.5 px-2 rounded-lg hover:bg-white/10 text-orange-200 text-sm border-t border-orange-500/40 mt-1">
              <FiSettings size={13} />
              <span>Admin Login</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
