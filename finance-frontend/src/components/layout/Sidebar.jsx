import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, CreditCard, PiggyBank, Target, RefreshCcw,
  BarChart2, Bot, Settings, LogOut, ChevronLeft, ChevronRight,
  Sparkles, MessageSquare, X,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = (t) => [
  { to: "/",              icon: LayoutDashboard, label: t("nav.dashboard"),    end: true },
  { to: "/transactions",  icon: CreditCard,       label: t("nav.transactions") },
  { to: "/budgets",       icon: PiggyBank,        label: t("nav.budgets") },
  { to: "/goals",         icon: Target,           label: t("nav.goals") },
  { to: "/recurring",     icon: RefreshCcw,       label: t("nav.recurring") },
  { to: "/reports",       icon: BarChart2,        label: t("nav.reports") },
  { to: "/ai-assistant",  icon: Bot,              label: t("nav.ai_assistant") },
  { to: "/sms-import",    icon: MessageSquare,    label: t("nav.sms_import") },
];

function NavItem({ to, icon: Icon, label, collapsed, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group/nav relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
         transition-all duration-150 cursor-pointer
         ${isActive
           ? "bg-blue-600 text-white shadow-sm"
           : "text-slate-400 hover:text-white hover:bg-slate-700/60"
         }`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <span
        className={`whitespace-nowrap transition-all duration-200 overflow-hidden
          ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
      >
        {label}
      </span>

      {/* Tooltip — only visible when collapsed */}
      {collapsed && (
        <div
          className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
                     bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg
                     whitespace-nowrap opacity-0 group/nav-hover:opacity-100
                     border border-slate-700 z-50 transition-opacity duration-150"
          role="tooltip"
        >
          {label}
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { logout, user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS(t);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div
      className={`flex flex-col h-full transition-[width] duration-300 ease-in-out
        ${sidebarCollapsed ? "w-[68px]" : "w-64"}`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700/60 min-h-[65px]">
        <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200
          ${sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-500/30">
            F
          </div>
          <div>
            <p className="text-sm font-bold text-white whitespace-nowrap leading-tight">Finance Manager</p>
            {user?.tier === "premium" && (
              <p className="flex items-center gap-1 text-yellow-400 text-[10px] font-medium">
                <Sparkles size={9} /> {t("common.premium")}
              </p>
            )}
          </div>
        </div>

        {/* Logo icon when collapsed */}
        {sidebarCollapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-500/30 mx-auto">
            F
          </div>
        )}

        {/* Collapse toggle button — desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg
                     bg-slate-700/60 hover:bg-slate-600 text-slate-400 hover:text-white
                     transition-colors flex-shrink-0 ml-auto"
          aria-label={sidebarCollapsed ? t("nav.expand_sidebar") : t("nav.collapse_sidebar")}
        >
          {sidebarCollapsed
            ? <ChevronRight size={13} />
            : <ChevronLeft size={13} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none p-2 space-y-0.5">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={sidebarCollapsed}
            onClick={onMobileClose}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="p-2 border-t border-slate-700/60 space-y-0.5">
        <NavItem
          to="/settings"
          icon={Settings}
          label={t("nav.settings")}
          collapsed={sidebarCollapsed}
          onClick={onMobileClose}
        />

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      text-red-400 hover:bg-red-500/15 hover:text-red-300
                      transition-all duration-150`}
          aria-label={t("nav.logout")}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-all duration-200 overflow-hidden
              ${sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
          >
            {t("nav.logout")}
          </span>
        </button>

        {/* User avatar row */}
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl bg-slate-800/50">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center
                            text-white text-xs font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 h-screen z-40
                   bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
                   flex-col overflow-hidden"
        style={{ width: sidebarCollapsed ? 68 : 256, transition: "width 300ms ease-in-out" }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 lg:hidden
                    bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
                    flex flex-col overflow-hidden
                    transition-transform duration-300 ease-in-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 256 }}
      >
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white
                     hover:bg-slate-700 transition-colors z-10"
          aria-label={t("header.open_menu")}
        >
          <X size={16} />
        </button>
        {/* Use non-collapsed version for mobile */}
        <div className="flex flex-col h-full w-64">
          <div className="flex items-center gap-2.5 px-3 py-4 border-b border-slate-700/60 min-h-[65px]">
            <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">
              F
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Finance Manager</p>
              {user?.tier === "premium" && (
                <p className="flex items-center gap-1 text-yellow-400 text-[10px] font-medium">
                  <Sparkles size={9} /> {t("common.premium")}
                </p>
              )}
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} collapsed={false} onClick={onMobileClose} />
            ))}
          </nav>
          <div className="p-2 border-t border-slate-700/60 space-y-0.5">
            <NavItem to="/settings" icon={Settings} label={t("nav.settings")} collapsed={false} onClick={onMobileClose} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span>{t("nav.logout")}</span>
            </button>
            {user && (
              <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl bg-slate-800/50">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
