import { useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">

            {/* LEFT SIDE */}
            <h1 className="text-lg font-semibold">Finance App</h1>
                  {/* CENTER NAV LINKS */}
        <div className="flex gap-4">
            
            <Link
            to="/"
            className={`px-3 py-1 rounded ${
                location.pathname === "/" ? "bg-blue-500" : "bg-gray-700"
            }`}
            >
            Dashboard
            </Link>

            <Link
            to="/transactions"
            className={`px-3 py-1 rounded ${
                location.pathname === "/transactions"
                ? "bg-blue-500"
                : "bg-gray-700"
            }`}
            >
            Transactions
            </Link>
        </div>

        {/* RIGHT SIDE */}
        <button 
        onClick={handleLogout}
        className="bg-red-500 px-3 py-1 rounded">
            Logout
        </button>
        </div>
    );
    };

export default Navbar;