import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { User, Lock, Globe, DollarSign, Save } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AED", "SAR", "SGD", "AUD", "CAD"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "te", label: "తెలుగు" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, login } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/users/profile").then((r) => r.data.data),
    staleTime: 60000,
  });

  const [profileForm, setProfileForm] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Populate form once profile loads
  const formData = profileForm ?? {
    name: profile?.name || "",
    monthlyIncome: profile?.monthlyIncome || "",
    preferredCurrency: profile?.preferredCurrency || "INR",
    preferredLanguage: profile?.preferredLanguage || "en",
  };

  const profileMutation = useMutation({
    mutationFn: (data) => api.put("/users/profile", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
      setProfileForm(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put("/users/change-password", data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to change password"),
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate({
      ...formData,
      monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    passwordMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <>
      <Helmet><title>Settings — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("settings.title")}</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <User size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{profile?.name}</p>
                <p className="text-sm text-gray-500">{profile?.email}</p>
                {profile?.tier === "premium" && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">✨ Premium</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setProfileForm({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={profile?.email || ""}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyIncome}
                  onChange={(e) => setProfileForm({ ...formData, monthlyIncome: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
            >
              <Save size={15} />
              {profileMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <Globe size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Language & Currency</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Language</label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setProfileForm({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.preferredCurrency}
                  onChange={(e) => setProfileForm({ ...formData, preferredCurrency: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={handleProfileSubmit}
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
            >
              <Save size={15} />
              {profileMutation.isPending ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <Lock size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Min. 6 characters"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-60 text-sm font-medium"
            >
              <Lock size={15} />
              {passwordMutation.isPending ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-red-50">
            <h2 className="font-semibold text-red-700">Danger Zone</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <button
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 text-sm font-medium transition"
              onClick={() => toast.error("Contact support to delete your account")}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
