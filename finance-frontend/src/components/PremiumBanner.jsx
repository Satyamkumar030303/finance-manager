import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function PremiumBanner({ feature = "This feature" }) {
  const { user } = useContext(AuthContext);

  const checkoutMutation = useMutation({
    mutationFn: () => api.post("/payments/create-checkout"),
    onSuccess: (res) => {
      if (res.data?.url) window.location.href = res.data.url;
    },
    onError: (err) => toast.error(err.response?.data?.message || "Unable to start checkout"),
  });

  if (user?.tier === "premium") return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-yellow-300" />
          </div>
          <div>
            <p className="font-semibold">{feature} requires Premium</p>
            <p className="text-blue-100 text-sm mt-0.5">
              Upgrade to unlock AI chat, advanced analytics, unlimited budgets, and more. Just ₹299/month.
            </p>
          </div>
        </div>
        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending}
          className="flex items-center gap-1.5 bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm flex-shrink-0 disabled:opacity-60"
        >
          Upgrade <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
