import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, CreditCard, LogOut, Menu } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-900 text-white p-2 rounded-md"
      >
        <Menu size={20} />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
        group fixed top-0 left-0 h-screen
        bg-gradient-to-b from-slate-900 to-slate-800
        text-white flex flex-col
        transition-all duration-300
        ${open ? "w-64" : "w-16"}
        lg:w-16 lg:hover:w-64
        z-40
      `}
      >
        {/* LOGO */}
        <div className="flex items-center justify-center lg:justify-start gap-3 p-4 border-b border-slate-700">

          <div className="bg-blue-500 w-8 h-8 flex items-center justify-center rounded-md font-bold">
            F
          </div>

          <span className="hidden lg:group-hover:block whitespace-nowrap">
            Finance Manager
          </span>

        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-2 p-2 flex-1">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition ${
                isActive ? "bg-blue-600" : "hover:bg-slate-700"
              }`
            }
          >
            <LayoutDashboard size={22} />

            <span className="hidden lg:group-hover:block whitespace-nowrap">
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition ${
                isActive ? "bg-blue-600" : "hover:bg-slate-700"
              }`
            }
          >
            <CreditCard size={22} />

            <span className="hidden lg:group-hover:block whitespace-nowrap">
              Transactions
            </span>
          </NavLink>

        </nav>

        {/* LOGOUT */}
        <div className="p-2 border-t border-slate-700">

          <button
            onClick={handleLogout}
            className="flex items-center justify-center lg:justify-start gap-3 w-full p-3 rounded-lg bg-red-500 hover:bg-red-600 transition"
          >
            <LogOut size={22} />

            <span className="hidden lg:group-hover:block whitespace-nowrap">
              Logout
            </span>

          </button>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;