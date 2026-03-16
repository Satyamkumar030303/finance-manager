import { useForm } from "react-hook-form";
import { useLogin } from "../../hooks/auth/useLogin";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { register, handleSubmit } = useForm();
    const {mutate, isPending } = useLogin();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = (data) => {
        mutate(data, {
            onSuccess: (res) => {
                login(res.data);
                navigate("/");
            },
            onError: (err) => {
                allert(err.response.data.message || "Something went wrong");
            }
        });
    };


return (
    <div className= "min-h-screen flex item-center justify-center by-gray-100">
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
        <h2 className="text-xl font-semibold mb-4 text-center">
            Login
        </h2>
            
        <input
        type="email"
        placeholder="Email"
        {...register("email") }
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />

        <input
        type="password"
        placeholder="Password"
        {...register("password") }
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
        {isPending ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm mt-3 text-center">
            Don’t have an account?{" "}
            <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/register")}
            >
                Register
            </span>
            </p>
      </form>
    </div>
    );
};

export default Login;