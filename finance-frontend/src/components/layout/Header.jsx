import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell, Globe, Sun, Moon, Menu, Search, Settings, LogOut,
  ChevronDown, Sparkles,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
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

function IconBtn({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-xl text-gray-500 dark:text-gray-400
                 hover:bg-gray-100 dark:hover:bg-gray-800
                 hover:text-gray-900 dark:hover:text-gray-100
                 transition-colors duration-150"
    >
      {children}
    </button>
  );
}

function ProfileDropdown({ user, onClose }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const go = (path) => { navigate(path); onClose(); };
  const handleLogout = () => { logout(); navigate("/login"); onClose(); };

  return (
    <div className="absolute right-0 top-full mt-2 w-52 card-raised py-1 z-50 animate-scaleIn">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
        {user?.tier === "premium" && (
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
            <Sparkles size={9} /> Premium
          </span>
        )}
      </div>
      <button
        onClick={() => go("/settings")}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                   hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Settings size={14} /> Settings
      </button>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400
                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut size={14} /> Logout
      </button>
    </div>
  );
}

export default function Header({ onMenuClick }) {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between
                 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
                 border-b border-gray-200 dark:border-gray-800
                 px-4 lg:px-6 h-16"
    >
      {/* Left: mobile menu + page context */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800
                        rounded-xl px-3 py-2 w-48 lg:w-64 transition-all duration-200
                        focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={t("header.search", "Search...")}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Language */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl
                        text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-colors cursor-pointer">
          <Globe size={15} />
          <select
            onChange={handleLanguageChange}
            defaultValue={i18n.language?.substring(0, 2) || "en"}
            className="bg-transparent text-xs focus:outline-none cursor-pointer
                       text-gray-600 dark:text-gray-400 max-w-[72px]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Theme toggle */}
        <IconBtn onClick={toggleTheme} label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </IconBtn>

        {/* Notifications */}
        <IconBtn label="Notifications">
          <div className="relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </IconBtn>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 ml-1 pl-2 pr-1 py-1.5 rounded-xl
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
                            flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
              {user?.name?.split(" ")[0]}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-150 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <ProfileDropdown user={user} onClose={() => setProfileOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
}
