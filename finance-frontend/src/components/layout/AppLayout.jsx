import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex">

      <Sidebar />

      <div className="flex-1 ml-16 transition-all duration-300">

        <Header />

        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AppLayout;