import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";
import { MdOutlineRiceBowl } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="glass-panel mx-2 mb-2 rounded-t-3xl text-zinc-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-white mb-6">
              <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-2 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <MdOutlineRiceBowl size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight">Desi Dhaba</span>
                <span className="block text-[9px] text-rose-400 font-bold tracking-[0.2em] uppercase">
                  Midnight Gourmet
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              The premium delivery experience. Authentic flavors, hyper-fast delivery, served around the clock.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 tracking-wider text-xs uppercase opacity-80">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-rose-400 transition-colors text-sm">Home</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-rose-400 transition-colors text-sm">Track Order</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-rose-400 transition-colors text-sm">Login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 tracking-wider text-xs uppercase opacity-80">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-rose-400 transition-colors text-sm">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="hover:text-rose-400 transition-colors text-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-rose-400 transition-colors text-sm">Refund Policy</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 tracking-wider text-xs uppercase opacity-80">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all hover:scale-110 shadow-lg">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all hover:scale-110 shadow-lg">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all hover:scale-110 shadow-lg">
                <FiInstagram size={18} />
              </a>
            </div>
            <p className="mt-6 text-sm text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              All systems operational
            </p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-zinc-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Midnight Gourmet / Desi Dhaba. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Cookie Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
