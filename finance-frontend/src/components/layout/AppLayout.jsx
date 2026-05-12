import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTheme } from "../../context/ThemeContext";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function AppLayout() {
  const { sidebarCollapsed } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const marginLeft = isDesktop ? (sidebarCollapsed ? 68 : 256) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="flex-1 flex flex-col min-w-0"
        style={{
          marginLeft,
          transition: "margin-left 300ms ease-in-out",
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
