import { Link } from "react-router-dom";
import { MdOutlineRiceBowl } from "react-icons/md";
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-orange-600 p-1.5 rounded-xl">
                <MdOutlineRiceBowl size={20} className="text-yellow-300" />
              </div>
              <span className="text-white text-xl font-extrabold">Desi Dhaba</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Bringing authentic Indian flavours to your doorstep. Fresh, fast, and always delicious.
            </p>
            <div className="flex items-center space-x-3 mt-5">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/orders", label: "My Orders" },
                { to: "/cart", label: "Cart" },
                { to: "/profile", label: "My Profile" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-orange-400 transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                "Terms of Service",
                "Privacy Policy",
                "Refund Policy",
                "Cookie Policy",
              ].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-orange-400 transition">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <FiMapPin size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span>12, Food Street, Spice City, India – 110001</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <FiPhone size={15} className="text-orange-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <FiMail size={15} className="text-orange-500 flex-shrink-0" />
                <span>hello@desidhaba.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Desi Dhaba. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Made with ❤️ in India</span>
            <span>•</span>
            <span>Powered by Desi Dhaba Platform v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
