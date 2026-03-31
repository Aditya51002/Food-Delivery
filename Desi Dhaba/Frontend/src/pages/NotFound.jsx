import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MdOutlineRiceBowl } from "react-icons/md";
import { FiArrowLeft, FiHome } from "react-icons/fi";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 — Page Not Found | Desi Dhaba";
    return () => { document.title = "Desi Dhaba"; };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-gradient-to-br from-rose-500 to-amber-500 relative z-10">
        <MdOutlineRiceBowl size={40} className="text-white" />
      </div>

      <h1
        className="text-9xl font-black mb-4 select-none relative z-10 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]"
        style={{
          background: "linear-gradient(135deg, #f43f5e, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </h1>

      <h2 className="text-2xl font-black text-white mb-3 tracking-tight relative z-10">Page Not Found</h2>
      <p className="text-zinc-500 text-sm max-w-sm leading-relaxed mb-10 font-medium relative z-10">
        This page doesn't exist or was moved. Let's get you back — there's great food waiting for you!
      </p>

      <div className="flex gap-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2 px-6 py-3"
        >
          <FiArrowLeft size={16} />
          Go Back
        </button>
        <Link
          to="/"
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <FiHome size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
