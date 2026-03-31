import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Login successful!", { style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } });
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md w-full glass-card rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/5 relative z-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input transition-all duration-300 focus:bg-zinc-800 focus:border-rose-500/50 font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base tracking-widest uppercase mt-4 shadow-[0_10px_30px_rgba(244,63,94,0.3)] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-zinc-500 mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-rose-400 font-bold hover:text-rose-300 transition-colors">
            Register for access
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
