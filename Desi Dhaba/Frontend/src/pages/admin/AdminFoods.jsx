import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiArrowLeft } from "react-icons/fi";

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
        API.get(`/foods/${restaurantId}`),
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
        toast.success("Food item updated!");
      } else {
        await API.post(`/foods/${restaurantId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Food item created!");
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
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await API.delete(`/foods/item/${foodId}`);
      toast.success("Food item deleted!");
      fetchData();
    } catch {
      toast.error("Failed to delete food item");
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
      <div className="flex items-center space-x-3 mb-6">
        <Link to="/admin/restaurants" className="text-gray-500 hover:text-gray-700 transition">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {restaurant?.name || "Restaurant"} - Menu
          </h1>
          <p className="text-sm text-gray-500">{foods.length} items</p>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <FiPlus size={18} />
          <span>Add Food Item</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editId ? "Edit Food Item" : "Add Food Item"}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  placeholder="e.g., Starters, Main Course, Desserts"
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
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label className="text-sm text-gray-700">Available</label>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : editId ? "Update Food Item" : "Create Food Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Food Items Grid */}
      {foods.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No food items yet. Add one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => (
            <div key={food._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-36 bg-gray-200 overflow-hidden">
                {food.image ? (
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{food.name}</h3>
                    <p className="text-orange-600 font-bold">₹{food.price}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {food.category}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      food.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {food.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => handleEdit(food)}
                    className="flex-1 flex items-center justify-center space-x-1 text-sm text-orange-600 border border-orange-600 py-1.5 rounded-lg hover:bg-orange-50 transition"
                  >
                    <FiEdit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(food._id)}
                    className="flex-1 flex items-center justify-center space-x-1 text-sm text-red-600 border border-red-600 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
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
