import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Lottie from "lottie-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Registration successful!", { style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } });
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors?.[0]?.message || data?.message || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Lottie animation for signup
  const lottieUrl = "https://assets9.lottiefiles.com/packages/lf20_jcikwtux.json";
  
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(lottieUrl)
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl w-full glass-card rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/5 relative z-10 flex flex-col md:flex-row items-center gap-10">
        
        {/* Lottie Animation Side */}
        <div className="hidden md:flex w-1/2 justify-center items-center">
          {animationData ? (
            <Lottie animationData={animationData} loop={true} className="w-full max-w-[350px] drop-shadow-2xl" />
          ) : (
            <div className="w-64 h-64 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
          )}
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Join the premium experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass-input transition-all duration-300 focus:bg-zinc-800 focus:border-rose-500/50"
                placeholder="Gourmet Enthusiast"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input transition-all duration-300 focus:bg-zinc-800 focus:border-rose-500/50"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Password</label>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider pr-1">Min 6 chars</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass-input transition-all duration-300 focus:bg-zinc-800 focus:border-rose-500/50 font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base tracking-widest uppercase mt-4 shadow-[0_10px_30px_rgba(244,63,94,0.3)] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="text-center md:text-left text-sm font-medium text-zinc-500 mt-8">
            Already a member?{" "}
            <Link to="/login" className="text-rose-400 font-bold hover:text-rose-300 transition-colors">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
