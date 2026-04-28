"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Lock, Heart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import useGuestRedirect from "@/hooks/useGuestRedirect";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useUser();
useGuestRedirect();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (result.success) {
        login(result.user, result.token); // store in cookies
        toast.success(result.message);
        router.push("/");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Server error, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-30 top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-rose-300 rounded-full blur-3xl opacity-30 bottom-10 right-10"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-96 flex flex-col gap-4 border border-pink-200"
      >
        <h2 className="text-2xl flex gap-3 font-bold justify-center items-center text-pink-600">
          <Heart className="text-pink-500 w-6 h-6 fill-pink-500" />
          Login
        </h2>

        {/* Email */}
        <div className="flex items-center border border-gray-300 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          <Mail className="text-pink-400 w-4 h-4" />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Password */}
        <div className="flex items-center border border-gray-300 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          <Lock className="text-pink-400 w-4 h-4" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
        </div>

        <button
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg transition font-semibold shadow-md"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-pink-500">
          New here?{" "}
          <a
            href="/register"
            className="text-pink-600 font-semibold hover:underline"
          >
            Register Here!
          </a>
        </p>
      </form>
    </div>
  );
}