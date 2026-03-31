import { useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { FiX, FiStar } from "react-icons/fi";

const ReviewModal = ({ isOpen, onClose, targetType, targetId, orderId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return toast.error("Please select a rating");
    }

    setLoading(true);
    try {
      await API.post("/reviews", {
        targetType,
        targetId,
        orderId,
        rating,
        comment,
      });
      toast.success("Review submitted successfully!", { style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-zinc-950/40 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight">Rate Experience</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white bg-zinc-900 rounded-full p-2 border border-white/5 transition hover:bg-rose-500/20 hover:border-rose-500/50">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 relative z-10">
          <div className="mb-10 flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-inner">
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">How was your premium masterclass?</p>
            <div className="flex space-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-125 duration-200"
                >
                  <FiStar
                    size={42}
                    className={`${
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                        : "fill-zinc-800 text-zinc-700"
                    } transition-all duration-300`}
                  />
                </button>
              ))}
            </div>
            <div className="h-6 mt-4 flex items-center justify-center">
              {rating > 0 && (
                <span className="text-sm font-black text-yellow-400 uppercase tracking-widest bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 shadow-inner animate-in slide-in-from-bottom-2 duration-300">
                  {["Disappointing", "Fair", "Satisfactory", "Exceptional", "Masterpiece"][rating - 1]}
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mb-3">
              Tasting Notes <span className="text-zinc-600 font-medium tracking-normal ml-1 capitalize">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your culinary experience details..."
              className="glass-input resize-none h-32"
              maxLength={500}
            />
            <p className="text-xs font-medium text-zinc-500 text-right mt-2 pr-1">{comment.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full btn-primary py-4 text-base tracking-widest uppercase shadow-[0_10px_30px_rgba(99,102,241,0.3)] disabled:opacity-50"
            style={{ backgroundImage: rating > 0 ? "linear-gradient(135deg, #6366f1, #a855f7)" : "" }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
