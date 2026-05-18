import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../../api/axios";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post("/auth/login", data, { _skipAuth: true }),
    onSuccess: (res) => {
      login(res.data);
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("All fields required");
    mutate(form);
  };

  return (
    <>
      <Helmet><title>Login — Finance Manager</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-white text-2xl font-bold">F</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Finance Manager</h1>
            <p className="text-slate-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 mt-2"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-gray-500 pt-1">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
