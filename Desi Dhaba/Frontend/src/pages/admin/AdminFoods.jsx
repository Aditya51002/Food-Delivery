import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiArrowLeft } from "react-icons/fi";
import { GiMeal } from "react-icons/gi";

const AdminFoods = () => {
  const { id: restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", isAvailable: true });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [resData, foodData] = await Promise.all([
        API.get(`/restaurants/${restaurantId}`),
        API.get(`/foods/restaurant/${restaurantId}`),
      ]);
      setRestaurant(resData.data);
      setFoods(foodData.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const resetForm = () => {
    setForm({ name: "", price: "", category: "", isAvailable: true });
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (food) => {
    setForm({
      name: food.name,
      price: food.price,
      category: food.category,
      isAvailable: food.isAvailable,
    });
    setEditId(food._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("isAvailable", form.isAvailable);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editId) {
        await API.put(`/foods/item/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Dish updated!", { style: { background: '#18181b', color: '#fff' }});
      } else {
        await API.post(`/foods/restaurant/${restaurantId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Dish added to menu!", { style: { background: '#18181b', color: '#fff' }});
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm("Are you sure you want to remove this dish?")) return;
    try {
      await API.delete(`/foods/item/${foodId}`);
      toast.success("Dish removed!", { style: { background: '#18181b', color: '#fff' }});
      fetchData();
    } catch {
      toast.error("Failed to remove dish");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-[80vh]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4">
          <Link to="/admin/restaurants" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {restaurant?.name || "VIP Venue"}
            </h1>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Menu Management <span className="text-zinc-700 mx-1">•</span> {foods.length} items</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <FiPlus size={18} />
          <span>Add Dish</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-2xl font-black text-white">{editId ? "Edit Dish" : "New Dish"}</h2>
              <button onClick={resetForm} className="text-zinc-500 hover:text-white bg-zinc-900 rounded-full p-2 border border-white/5 transition hover:bg-rose-500/20 hover:border-rose-500/50">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="glass-input"
                  placeholder="e.g. Truffle Mac & Cheese"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Price (₹) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="glass-input"
                    placeholder="999"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Category <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    placeholder="e.g. Starters"
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Dish Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
              
              <div className="flex items-center space-x-3 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div 
                  onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${form.isAvailable ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${form.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">In Stock</p>
                  <p className="text-xs text-zinc-500">Allow customers to order</p>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 text-base tracking-widest uppercase mt-4"
              >
                {submitting ? "Saving Data..." : editId ? "Update Dish" : "Add to Menu"}
              </button>
            </form>
          </div>
        </div>
      )}

      {foods.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-3xl border border-white/5">
          <GiMeal size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500 font-bold text-lg">Menu is completely empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <div key={food._id} className="glass-card rounded-3xl overflow-hidden border border-white/5 group flex flex-col hover:border-white/10 transition-all duration-300">
              <div className="h-48 bg-zinc-900 overflow-hidden relative">
                {food.image ? (
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-950">
                    <GiMeal size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                
                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                    food.isAvailable ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}>
                    {food.isAvailable ? "Available" : "Sold Out"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 relative z-10 bg-zinc-950/50 -mt-8 pt-8">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-black text-white text-lg leading-tight line-clamp-2">{food.name}</h3>
                </div>
                
                <div className="flex items-center justify-between mb-4 mt-1">
                  <span className="text-xs text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                    {food.category}
                  </span>
                  <p className="text-xl font-black text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">₹{food.price}</p>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleEdit(food)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-400 border border-white/10 py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    <FiEdit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(food._id)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400/70 border border-red-500/10 py-2.5 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    <FiTrash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
