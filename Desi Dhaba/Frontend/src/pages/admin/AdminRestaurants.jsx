import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", address: "", isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const { data } = await API.get("/restaurants");
      const normalized = Array.isArray(data) ? data : data?.restaurants || [];
      setRestaurants(normalized);
    } catch {
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", address: "", isActive: true });
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (restaurant) => {
    setForm({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      isActive: restaurant.isActive,
    });
    setEditId(restaurant._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("address", form.address);
    formData.append("isActive", form.isActive);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editId) {
        await API.put(`/restaurants/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Venue updated!", { style: { background: '#18181b', color: '#fff' }});
      } else {
        await API.post("/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Venue created!", { style: { background: '#18181b', color: '#fff' }});
      }
      resetForm();
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this venue?")) return;
    try {
      await API.delete(`/restaurants/${id}`);
      toast.success("Venue removed!", { style: { background: '#18181b', color: '#fff' }});
      fetchRestaurants();
    } catch {
      toast.error("Failed to remove venue");
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
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Partner Venues</h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage network</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <FiPlus size={18} />
          <span>Add Venue</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-2xl font-black text-white">{editId ? "Edit Venue" : "New Venue"}</h2>
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
                  placeholder="e.g. Spice & Flames"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="glass-input resize-none"
                  placeholder="A short tagline or background..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Address <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="glass-input"
                  placeholder="Full physical address"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
              <div className="flex items-center space-x-3 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div 
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${form.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${form.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Publicly Visible</p>
                  <p className="text-xs text-zinc-500">Allow users to see & order from here</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 text-base tracking-widest uppercase mt-4"
              >
                {submitting ? "Saving Data..." : editId ? "Update Venue Profile" : "Register Venue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-3xl border border-white/5">
          <MdOutlineRestaurant size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500 font-bold text-lg">No partner venues acquired yet.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-5">Partner</th>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {restaurants.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5 shadow-inner">
                          {r.image ? (
                            <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <MdOutlineRestaurant size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base leading-tight group-hover:text-rose-400 transition-colors">{r.name}</p>
                          <p className="text-xs text-zinc-500 font-medium mt-1 truncate max-w-[200px]">{r.description || "No description provided."}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 max-w-[250px]">
                      <p className="truncate font-medium">{r.address}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-zinc-900 border-white/5">
                        <div className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-600'}`} />
                        <span className={r.isActive ? "text-emerald-400" : "text-zinc-500"}>{r.isActive ? "Active" : "Hidden"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          to={`/admin/restaurants/${r._id}/foods`}
                          className="text-xs font-bold px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl border border-indigo-500/20 transition-all shadow-sm uppercase tracking-wider"
                        >
                          Menu
                        </Link>
                        <button
                          onClick={() => handleEdit(r)}
                          className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors border border-white/5"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
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
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;
