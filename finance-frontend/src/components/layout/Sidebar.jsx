import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, CreditCard, PiggyBank, Target, RefreshCcw,
  BarChart2, Bot, Settings, LogOut, Menu, X, Sparkles, MessageSquare
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const NavItem = ({ to, icon: Icon, label, open }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${
        isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-300 hover:text-white"
      }`
    }
  >
    <Icon size={20} className="flex-shrink-0" />
    {open && <span className="whitespace-nowrap text-sm font-medium">{label}</span>}
  </NavLink>
);

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/transactions", icon: CreditCard, label: t("nav.transactions") },
    { to: "/budgets", icon: PiggyBank, label: t("nav.budgets") },
    { to: "/goals", icon: Target, label: t("nav.goals") },
    { to: "/recurring", icon: RefreshCcw, label: t("nav.recurring") },
    { to: "/reports", icon: BarChart2, label: t("nav.reports") },
    { to: "/ai-assistant", icon: Bot, label: t("nav.ai_assistant") },
    { to: "/sms-import", icon: MessageSquare, label: "SMS Import" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-900 text-white p-2 rounded-md shadow-lg"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          group fixed top-0 left-0 h-screen z-40
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
          text-white flex flex-col
          transition-all duration-300 ease-in-out
          ${open ? "w-64 translate-x-0" : "w-16 -translate-x-full"}
          lg:translate-x-0 lg:w-16 lg:hover:w-64
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700 min-h-[64px]">
          <div className="bg-blue-500 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-white shadow">
            F
          </div>
          <div className={`${open ? "block" : "hidden"} lg:group-hover:block overflow-hidden`}>
            <span className="whitespace-nowrap font-semibold text-sm">Finance Manager</span>
            {user?.tier === "premium" && (
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <Sparkles size={10} /> Premium
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.to} className="relative group/item">
              <NavItem to={item.to} icon={item.icon} label={item.label} open={open} />
              {/* Tooltip for collapsed state on desktop */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none lg:group-hover:opacity-0 lg:group/item-hover:opacity-100 z-50 hidden lg:block group-hover:hidden">
                {item.label}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings + Logout */}
        <div className="p-2 border-t border-slate-700 space-y-1">
          <NavItem to="/settings" icon={Settings} label={t("nav.settings")} open={open} />

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-150"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {open && (
              <span className="whitespace-nowrap text-sm font-medium lg:group-hover:block hidden">
                {t("nav.logout")}
              </span>
            )}
            <span className={`whitespace-nowrap text-sm font-medium ${open ? "block lg:hidden" : "hidden"}`}>
              {t("nav.logout")}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
