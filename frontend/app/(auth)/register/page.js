"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import useGuestRedirect from "@/hooks/useGuestRedirect";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+91");
  useGuestRedirect();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get("econtact");
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      econtact: countryCode + phone,
    };

    if (data.password !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        login(result.user, result.token); // auto login after registration
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
      {/* Background glow blobs */}
      <div className="absolute w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-30 top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-rose-300 rounded-full blur-3xl opacity-30 bottom-10 right-10"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-96 flex flex-col gap-4 border border-pink-300"
      >
        <h2 className="text-2xl flex gap-3 items-center font-bold text-center text-pink-600">
          <Heart className="text-pink-500 w-6 h-6 fill-pink-500" />
          Register Now
        </h2>

        {/* Name */}
        <div className="flex items-center border border-gray-400 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          <input
            name="name"
            placeholder="Full Name"
            required
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-base"
          />
        </div>

        {/* Email */}
        <div className="flex items-center border border-gray-400 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-base"
          />
        </div>
        {/* Emergency Contact */}
        <div className="flex items-center border border-gray-400 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          {/* Country Code Dropdown */}
          <select
            name="countryCode"
            defaultValue="+91"
            className="bg-transparent outline-none text-gray-700 text-sm"
          >
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+61">🇦🇺 +61</option>
          </select>

          {/* Phone Input */}
          <input
            name="econtact"
            type="tel"
            placeholder="Your Contact"
            maxLength={10}
            required
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-base"
          />
        </div>
        {/* Password */}
        <div className="flex items-center border border-gray-400 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          <input
            name="password"
            type="password"
            placeholder="Password"
            minLength={6}
            required
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-base"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex items-center border border-gray-400 rounded px-2 focus-within:ring-2 focus-within:ring-pink-400">
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            className="p-2 w-full outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-base"
          />
        </div>

        <button
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg transition font-semibold shadow-md"
        >
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="text-sm text-center text-pink-500">
          Already registered?{" "}
          <a
            href="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
