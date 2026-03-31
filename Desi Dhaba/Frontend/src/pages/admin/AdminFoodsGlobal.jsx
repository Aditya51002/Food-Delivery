import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiStar,
} from "react-icons/fi";

const PREDEFINED_CATEGORIES = ["Pizza", "Burgers", "Fast Food", "Bakery", "Indian", "Drinks"];

const CATEGORY_EMOJI = {
  Pizza: "🍕", Burgers: "🍔", "Fast Food": "🍟",
  Bakery: "🧁", Indian: "🍛", Drinks: "🥤",
};

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "Pizza",
  rating: "4.0", isAvailable: true,
};

const Stars = ({ v }) => (
  <span className="flex items-center space-x-0.5 text-amber-400 text-sm">
    {[1, 2, 3, 4, 5].map((i) => (
      <FiStar key={i} size={12} className={i <= Math.round(v) ? "fill-amber-400" : "text-zinc-700"} />
    ))}
    <span className="ml-1 text-zinc-500 text-xs font-bold">{parseFloat(v).toFixed(1)}</span>
  </span>
);

const AdminFoodsGlobal = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFoods = async () => {
    try {
      const { data } = await API.get("/foods");
      setFoods(data);
    } catch {
      toast.error("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (food) => {
    setForm({
      name: food.name,
      description: food.description || "",
      price: String(food.price),
      category: food.category,
      rating: String(food.rating ?? 4.0),
      isAvailable: food.isAvailable,
    });
    setImageFile(null);
    setEditId(food._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Name, price and category are required");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    fd.append("category", form.category);
    fd.append("rating", form.rating);
    fd.append("isAvailable", form.isAvailable);
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editId) {
        await API.put(`/foods/item/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item updated!", { style: { background: '#18181b', color: '#fff' } });
      } else {
        await API.post("/foods/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item created!", { style: { background: '#18181b', color: '#fff' } });
      }
      closeForm();
      fetchFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/foods/item/${id}`);
      toast.success("Deleted!", { style: { background: '#18181b', color: '#fff' } });
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const visible = foods.filter((f) => {
    const matchCat = filterCat === "All" || f.category === filterCat;
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: foods.length,
    available: foods.filter((f) => f.isAvailable).length,
    categories: [...new Set(foods.map((f) => f.category))].length,
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
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Food Items</h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Global Menu Management</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <FiPlus size={18} />
          <span>Add Food Item</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Items", value: stats.total, accent: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { label: "Available", value: stats.available, accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Categories", value: stats.categories, accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="glass-card rounded-2xl p-5 text-center border border-white/5">
            <p className={`text-3xl font-black ${accent.split(" ")[0]}`}>{value}</p>
            <p className="text-xs text-zinc-500 mt-1 font-bold uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-zinc-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-white/5 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="glass-input min-w-[160px] py-2.5 text-sm"
        >
          <option value="All" className="bg-zinc-900">All Categories</option>
          {[...new Set(foods.map((f) => f.category))].sort().map((c) => (
            <option key={c} value={c} className="bg-zinc-900">
              {CATEGORY_EMOJI[c] || "🍽️"} {c}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        {visible.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🍽️</span>
            <p className="text-zinc-500 font-bold">No food items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Food Item</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visible.map((food) => (
                  <tr key={food._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-800 text-xl flex-shrink-0 border border-white/5 overflow-hidden shadow-inner">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            CATEGORY_EMOJI[food.category] || "🍽️"
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">{food.name}</p>
                          {food.description && (
                            <p className="text-xs text-zinc-600 line-clamp-1 max-w-xs font-medium">
                              {food.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-zinc-800 border border-white/5 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-lg">
                        <span>{CATEGORY_EMOJI[food.category] || "🍽️"}</span>
                        <span>{food.category}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black text-rose-400 text-base">₹{food.price}</td>
                    <td className="px-5 py-4">
                      <Stars v={food.rating ?? 4.0} />
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                          food.isAvailable
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${food.isAvailable ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-red-400"}`} />
                        {food.isAvailable ? "Available" : "Sold Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEdit(food)}
                          className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors border border-white/5"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(food._id, food.name)}
                          className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/5 hover:border-red-500/30"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-950/40 relative z-10">
              <h2 className="text-xl font-black text-white">
                {editId ? "Edit Food Item" : "Add New Food Item"}
              </h2>
              <button onClick={closeForm} className="text-zinc-500 hover:text-white bg-zinc-900 rounded-full p-2 border border-white/5 transition hover:bg-rose-500/20 hover:border-rose-500/50">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Margherita Pizza"
                  required
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description…"
                  rows={2}
                  className="glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="299"
                    required
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="glass-input"
                  >
                    {PREDEFINED_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900">
                        {CATEGORY_EMOJI[c]} {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Rating (0–5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center space-x-3 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                    <div
                      onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${form.isAvailable ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${form.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-bold text-white">Available</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0] || null)}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 btn-secondary py-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 text-sm"
                >
                  {submitting ? "Saving…" : editId ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodsGlobal;
