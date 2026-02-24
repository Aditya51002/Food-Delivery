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

/* ── Star display ─────────────────────────────────────── */
const Stars = ({ v }) => (
  <span className="flex items-center space-x-0.5 text-yellow-400 text-sm">
    {[1, 2, 3, 4, 5].map((i) => (
      <FiStar key={i} size={12} className={i <= Math.round(v) ? "fill-yellow-400" : "text-gray-300"} />
    ))}
    <span className="ml-1 text-gray-500 text-xs">{parseFloat(v).toFixed(1)}</span>
  </span>
);

/* ── Main component ────────────────────────────────────── */
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

  /* ── Data fetching ─────────────────────────────────── */
  const fetchFoods = async () => {
    try {
      // Admin needs all foods (including unavailable), so fetch without isAvailable filter
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

  /* ── Form helpers ──────────────────────────────────── */
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

  /* ── Submit (create / update) ──────────────────────── */
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
        toast.success("Food item updated!");
      } else {
        await API.post("/foods/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Food item created!");
      }
      closeForm();
      fetchFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ────────────────────────────────────────── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/foods/item/${id}`);
      toast.success("Deleted!");
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── Derived filtered list ─────────────────────────── */
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

  /* ── Render ────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Food Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all menu items across the platform</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow"
        >
          <FiPlus size={18} />
          <span>Add Food Item</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Items", value: stats.total, color: "text-orange-600" },
          { label: "Available", value: stats.available, color: "text-green-600" },
          { label: "Categories", value: stats.categories, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search food items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        {/* Category filter */}
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="All">All Categories</option>
          {[...new Set(foods.map((f) => f.category))].sort().map((c) => (
            <option key={c} value={c}>
              {CATEGORY_EMOJI[c] || "🍽️"} {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🍽️</span>
            <p>No food items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Food Item</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Category</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((food) => (
                  <tr key={food._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 text-xl flex-shrink-0">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            CATEGORY_EMOJI[food.category] || "🍽️"
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{food.name}</p>
                          {food.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                              {food.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center space-x-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <span>{CATEGORY_EMOJI[food.category] || "🍽️"}</span>
                        <span>{food.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-orange-600">₹{food.price}</td>
                    <td className="px-4 py-3">
                      <Stars v={food.rating ?? 4.0} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          food.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {food.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEdit(food)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(food._id, food.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
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

      {/* ── Add / Edit Modal ──────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editId ? "Edit Food Item" : "Add New Food Item"}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition">
                <FiX size={22} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Margherita Pizza"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the item…"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Price + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="299"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {PREDEFINED_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_EMOJI[c]} {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rating + Availability row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0 – 5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div
                      onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.isAvailable ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.isAvailable ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-medium transition disabled:opacity-60"
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
