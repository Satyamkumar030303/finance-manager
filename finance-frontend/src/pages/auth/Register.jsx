
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const registerUser = (data) => api.post("/auth/register", data);

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
  });

  const onSubmit = (data) => {
    console.log("REGISTER DATA:", data);

    mutate(data, {
      onSuccess: () => {
        navigate("/login");
      },
      onError: (err) => {
        console.error("REGISTER ERROR:", err.response?.data?.error);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          {...register("name", { required: true })}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: true })}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white py-2 rounded"
        >
          {isPending ? "Creating..." : "Register"}
        </button>
        <p className="text-sm mt-3 text-center">
            Already have an account?{" "}
            <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/login")}
            >
                Login
            </span>
            </p>
      </form>
    </div>
  );
};

export default Register;