import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { User, Lock, Globe, Save, Sun, Moon, Palette, Sparkles } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

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

function SectionCard({ icon: Icon, iconColor = "text-blue-600 dark:text-blue-400", title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800
                      bg-gray-50 dark:bg-gray-800/50">
        <Icon size={16} className={iconColor} />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { theme, setTheme, isDark, font, setFont, fonts } = useTheme();
  const { symbol } = useCurrency();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/users/profile").then((r) => r.data.data),
    staleTime: 60000,
  });

  const [profileForm, setProfileForm] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const formData = profileForm ?? {
    name: profile?.name || "",
    monthlyIncome: profile?.monthlyIncome || "",
    preferredCurrency: profile?.preferredCurrency || "INR",
    preferredLanguage: profile?.preferredLanguage || "en",
  };

  const profileMutation = useMutation({
    mutationFn: (data) => api.put("/users/profile", data),
    onSuccess: () => {
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
    profileMutation.mutate({ ...formData, monthlyIncome: parseFloat(formData.monthlyIncome) || 0 });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    passwordMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-40 w-full rounded-2xl" />)}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Settings — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="page-title">{t("settings.title")}</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>

        {/* ── Appearance ── */}
        <SectionCard icon={Palette} title="Appearance">
          <div className="space-y-5">
            {/* Theme */}
            <div>
              <p className="label mb-2">Theme</p>
              <div className="flex gap-3">
                {[
                  { val: "light", icon: Sun, label: "Light" },
                  { val: "dark",  icon: Moon, label: "Dark" },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${theme === val
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <p className="label mb-2">Interface Font</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    style={{ fontFamily: f.id }}
                    className={`py-2 px-3 rounded-xl border text-sm transition-all
                      ${font === f.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Profile ── */}
        <SectionCard icon={User} title="Profile Information">
          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
                            flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20">
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
              {profile?.tier === "premium" && (
                <span className="badge-yellow mt-1">
                  <Sparkles size={9} /> Premium
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                value={formData.name}
                onChange={(e) => setProfileForm({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                value={profile?.email || ""}
                disabled
                className="input opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label">{t("settings.monthly_income")} ({symbol})</label>
              <input
                type="number" min="0"
                value={formData.monthlyIncome}
                onChange={(e) => setProfileForm({ ...formData, monthlyIncome: e.target.value })}
                className="input"
              />
            </div>
            <button type="submit" disabled={profileMutation.isPending} className="btn-primary">
              <Save size={14} />
              {profileMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </SectionCard>

        {/* ── Language & Currency ── */}
        <SectionCard icon={Globe} title="Language & Currency">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Display Language</label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setProfileForm({ ...formData, preferredLanguage: e.target.value })}
                className="input"
              >
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select
                value={formData.preferredCurrency}
                onChange={(e) => setProfileForm({ ...formData, preferredCurrency: e.target.value })}
                className="input"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleProfileSubmit}
            disabled={profileMutation.isPending}
            className="btn-primary mt-4"
          >
            <Save size={14} />
            {profileMutation.isPending ? "Saving..." : "Save Preferences"}
          </button>
        </SectionCard>

        {/* ── Change Password ── */}
        <SectionCard icon={Lock} title="Change Password">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Min. 6 characters"
                className="input"
                required minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
              <Lock size={14} />
              {passwordMutation.isPending ? "Changing..." : "Change Password"}
            </button>
          </form>
        </SectionCard>

        {/* ── Danger Zone ── */}
        <div className="card border-red-200 dark:border-red-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Delete Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              className="btn border border-red-400 dark:border-red-700 text-red-500 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/30 btn-sm flex-shrink-0"
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
