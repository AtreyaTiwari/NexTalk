import { useState } from "react";
import Logo from "../components/Logo";
import { Phone, Lock, User } from "lucide-react";
import api from "../api/axios";

export default function Register({ switchToLogin }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validations
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter valid 10-digit mobile number");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        mobile,
        password,
      });

      setSuccess("Registration successful. Please login.");

      setName("");
      setMobile("");
      setPassword("");

      setTimeout(() => {
        switchToLogin();
      }, 1200);

    } catch (err) {
      const message =
        err?.response?.data ||
        "Registration failed. Mobile may already exist.";

      setError(
        typeof message === "string"
          ? message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#A3E635]/15 blur-[160px] rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[600px] h-[600px] bg-blue-500/25 blur-[160px] rounded-full bottom-[-150px] right-[-150px]" />
      <div className="absolute w-[450px] h-[450px] bg-indigo-500/15 blur-[130px] rounded-full top-[30%] left-[30%]" />

      {/* Glass Card */}
      <div className="glass p-12 rounded-3xl w-[400px] relative z-10 shadow-2xl backdrop-blur-xl border border-white/10">
        {/* Branding */}
        <div className="text-center mb-4">
          <Logo />
          <p className="text-gray-400 mt-2 text-sm">
            Create your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          {/* Name */}
          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 focus-within:border-[#A3E635]/60 transition-all">
            <User size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500 text-sm"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 focus-within:border-[#A3E635]/60 transition-all">
            <Phone size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500 text-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 focus-within:border-[#A3E635]/60 transition-all">
            <Lock size={18} className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500 text-sm"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-[#A3E635] hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Success */}
          {success && (
            <p className="text-green-400 text-sm">{success}</p>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#A3E635] text-black font-semibold hover:scale-[1.01] active:scale-95 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <button
            onClick={switchToLogin}
            className="text-[#A3E635] hover:underline"
            type="button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}