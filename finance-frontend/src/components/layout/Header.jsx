import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { Bell, Globe } from "lucide-react";
import i18n from "../../i18n/index.js";

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

export default function Header() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    if (user?.preferredLanguage !== lang) {
      localStorage.setItem("preferredLanguage", lang);
      // Set dir for RTL
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          {t("dashboard.title")}
        </h1>
        {user && (
          <p className="text-xs text-gray-500">
            {t("dashboard.welcome")}, <span className="font-medium text-gray-700">{user.name}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex items-center gap-1 text-gray-500">
          <Globe size={16} />
          <select
            onChange={handleLanguageChange}
            defaultValue={i18n.language?.substring(0, 2) || "en"}
            className="text-xs border-none bg-transparent focus:outline-none cursor-pointer text-gray-600 max-w-[90px]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Notification bell (placeholder) */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 relative" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
