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

  const handleLogout = async () => {
    await logout();
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

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLink = "hover:text-rose-400 text-zinc-300 transition-colors font-medium text-sm";

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-b-2xl mx-2 mt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-2 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:scale-105 transition-transform duration-300">
              <MdOutlineRiceBowl size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">Desi Dhaba</span>
              <span className="hidden sm:block text-[9px] text-rose-400 font-bold tracking-[0.2em] -mt-1 uppercase">
                Midnight Gourmet
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={navLink}>Home</Link>

            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-zinc-400 hover:text-white transition p-1"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>
              {searchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-9 glass-card rounded-2xl overflow-hidden w-72 flex p-1"
                >
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exquisite meals..."
                    className="flex-1 px-4 py-2 bg-transparent text-zinc-100 text-sm outline-none placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    className="bg-rose-600 px-4 rounded-xl text-white hover:bg-rose-500 transition shadow-md"
                  >
                    <FiSearch size={16} />
                  </button>
                </form>
              )}
            </div>

            {user ? (
              <>
                <Link to="/orders" className={`${navLink} flex items-center space-x-1.5 hover:text-white`}>
                  <FiPackage size={15} />
                  <span>Orders</span>
                </Link>
                <Link to="/cart" className="relative text-zinc-400 hover:text-white transition-colors">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[10px] shadow-[0_0_10px_rgba(244,63,94,0.6)] font-black rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                <div ref={profileRef} className="relative ml-2">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 pl-2 pr-3 py-1.5 rounded-full transition-all duration-300"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover shadow-sm ring-1 ring-white/10" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm text-white flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-200 max-w-[100px] truncate">{user.name}</span>
                    <FiChevronDown
                      size={14}
                      className={`text-zinc-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-12 glass-card rounded-2xl w-56 py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 hover:text-white transition text-sm"
                        >
                          <FiUser size={15} className="text-indigo-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 hover:text-white transition text-sm"
                        >
                          <FiPackage size={15} className="text-rose-400" />
                          <span>My Orders</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition text-sm w-full mt-1"
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
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary px-5 py-2 text-sm shadow-md">
                  Sign up
                </Link>
              </div>
            )}

            <div className="w-px h-5 bg-white/10 mx-2" />

            <Link
              to="/admin/login"
              className="flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition"
              title="Admin Portal"
            >
              <FiSettings size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              <Link to="/cart" className="relative text-zinc-300">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white shadow-lg text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-300 hover:text-white">
              {mobileOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-5 pt-3 border-t border-white/10 space-y-2 animate-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSearch} className="flex mb-4 relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full glass-input pr-12"
              />
              <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-zinc-700/50 rounded-lg text-white">
                <FiSearch size={16} />
              </button>
            </form>

            <Link to="/" className="block text-zinc-300 py-2 px-3 rounded-xl hover:bg-white/5 font-medium">Home</Link>
            
            {user ? (
              <div className="bg-zinc-800/40 rounded-2xl p-2 mt-4 border border-white/5">
                <div className="px-3 py-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                  Account Menu
                </div>
                <Link to="/profile" className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-zinc-300 hover:bg-white/5">
                  <FiUser className="text-indigo-400" /> Profile
                </Link>
                <Link to="/orders" className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-zinc-300 hover:bg-white/5">
                  <FiPackage className="text-rose-400" /> Orders
                </Link>
                <button onClick={handleLogout} className="flex w-full text-left items-center gap-3 py-2.5 px-3 rounded-xl text-zinc-400 hover:bg-white/5">
                  <FiLogOut /> Sign Out
                </button>
              </div>
            ) : (
               <div className="flex gap-3 pt-2">
                 <Link to="/login" className="flex-1 text-center btn-secondary py-2.5">Log in</Link>
                 <Link to="/register" className="flex-1 text-center btn-primary py-2.5">Sign up</Link>
               </div>
            )}
            
            <Link to="/admin/login" className="flex items-center justify-center space-x-2 py-3 mt-4 text-xs text-zinc-500 rounded-xl hover:bg-white/5">
              <FiSettings size={14} /> <span>Admin Portal</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
