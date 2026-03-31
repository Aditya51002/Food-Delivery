import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import { FiUser, FiLock, FiMapPin, FiCamera, FiTrash2, FiSave, FiPlus } from "react-icons/fi";

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Address Form
  const [newAddress, setNewAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (fileInputRef.current?.files[0]) {
        formData.append("avatar", fileInputRef.current.files[0]);
      }

      await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully", { style: { background: '#18181b', color: '#fff' }});
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    try {
      await API.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully", { style: { background: '#18181b', color: '#fff' }});
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setLoadingAddress(true);
    try {
      await API.post("/auth/addresses", { address: newAddress });
      toast.success("Address added", { style: { background: '#18181b', color: '#fff' }});
      setNewAddress("");
      await fetchUser();
    } catch (err) {
      toast.error("Failed to add address");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await API.delete(`/auth/addresses/${id}`);
      toast.success("Address deleted", { style: { background: '#18181b', color: '#fff' }});
      await fetchUser();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      <div className="mb-10 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Gourmet Profile</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your premium account settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 space-y-3">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
              activeTab === "profile" 
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                : "glass-panel text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "profile" ? "bg-rose-500/20" : "bg-zinc-800/50"}`}>
              <FiUser size={16} />
            </div>
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
              activeTab === "addresses" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                : "glass-panel text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "addresses" ? "bg-emerald-500/20" : "bg-zinc-800/50"}`}>
              <FiMapPin size={16} />
            </div>
            <span>Saved Deliveries</span>
          </button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
              activeTab === "security" 
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                : "glass-panel text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "security" ? "bg-indigo-500/20" : "bg-zinc-800/50"}`}>
              <FiLock size={16} />
            </div>
            <span>Security</span>
          </button>
        </div>

        <div className="flex-1 glass-card rounded-3xl p-6 sm:p-10 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          {activeTab === "profile" && (
            <div className="relative z-10 animate-in fade-in duration-300">
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Personal Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                
                <div className="flex items-center space-x-8 pb-8 border-b border-white/5">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border-4 border-zinc-900 shadow-xl transition-transform group-hover:scale-105">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser size={40} className="text-zinc-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-1 right-1 bg-rose-500 p-2.5 rounded-full text-white hover:bg-rose-600 transition shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:scale-110"
                    >
                      <FiCamera size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-1">Avatar</p>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xs">Upload a photo to personalize your premium gourmet experience. Max 5MB (JPG/PNG).</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Email <span className="text-rose-500/70 capitalize tracking-normal ml-1">Fixed</span></label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-5 py-3.5 bg-zinc-900/50 border border-transparent rounded-xl text-zinc-500 cursor-not-allowed font-medium shadow-inner"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 max-w-md">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="btn-primary px-8 py-3.5 flex items-center space-x-2"
                  >
                    <FiSave size={16} />
                    <span>{loadingProfile ? "Saving..." : "Save Profile"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="relative z-10 animate-in fade-in duration-300">
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Delivery Addresses</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {user.addresses?.length === 0 ? (
                  <div className="col-span-full py-12 text-center glass-panel rounded-2xl border border-white/5">
                    <FiMapPin size={32} className="mx-auto text-zinc-600 mb-3" />
                    <p className="text-zinc-500 font-medium">No saved addresses. Add one below for faster checkout.</p>
                  </div>
                ) : (
                  user.addresses?.map((addr) => (
                    <div key={addr._id} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition group flex flex-col justify-between h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                          <FiMapPin className="text-emerald-400" size={16} />
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium pt-1">{addr.address}</p>
                      </div>
                      <div className="flex justify-end relative z-10">
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/20 transition"
                        >
                          <FiTrash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                  <FiPlus className="text-emerald-400" /> New Address
                </h3>
                <form onSubmit={handleAddAddress} className="relative z-10">
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="E.g. Penthouse 4, Cyber Tower, Neo City..."
                    rows={3}
                    className="glass-input resize-none mb-6"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loadingAddress}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition disabled:opacity-50"
                  >
                    {loadingAddress ? "Adding..." : "Add Address"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="relative z-10 animate-in fade-in duration-300">
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Security Settings</h2>
              
              <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5 relative overflow-hidden max-w-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
                
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-8 relative z-10 flex items-center gap-2">
                   <FiLock size={14} /> Update Password
                </h3>
                
                <form onSubmit={handleChangePassword} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="glass-input font-mono tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="glass-input font-mono tracking-widest"
                      placeholder="••••••••"
                    />
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1 pt-1">Min 6 characters</p>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={loadingPassword}
                      className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition disabled:opacity-50"
                    >
                      {loadingPassword ? "Updating..." : "Secure Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
