import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

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
      setRestaurants(data);
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
        toast.success("Restaurant updated!");
      } else {
        await API.post("/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Restaurant created!");
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
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    try {
      await API.delete(`/restaurants/${id}`);
      toast.success("Restaurant deleted!");
      fetchRestaurants();
    } catch {
      toast.error("Failed to delete restaurant");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Restaurants</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <FiPlus size={18} />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editId ? "Edit Restaurant" : "Add Restaurant"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : editId ? "Update Restaurant" : "Create Restaurant"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Restaurant Table */}
      {restaurants.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No restaurants yet. Add one!</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Image</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Address</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {r.image ? (
                          <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">{r.name}</td>
                    <td className="px-6 py-3 text-gray-500 max-w-[200px] truncate">{r.address}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/restaurants/${r._id}/foods`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded"
                        >
                          Menu
                        </Link>
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-orange-600 hover:text-orange-800 p-1"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FiTrash2 size={16} />
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
