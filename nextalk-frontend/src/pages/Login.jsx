import { useState } from "react";
import Logo from "../components/Logo";
import { Phone, Lock } from "lucide-react";
import api from "../api/axios";

export default function Login({ switchToRegister, onLoginSuccess }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        mobile,
        password,
      });

      const token = response.data;

      localStorage.setItem("token", token);
      onLoginSuccess();

      console.log("Login Success");
      console.log(token);

    } catch (err) {
      setError("Invalid mobile or password");
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
            Start your secure conversations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* Phone */}
          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 focus-within:border-[#A3E635]/60 focus-within:bg-white/10 transition-all duration-200">
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
          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 focus-within:border-[#A3E635]/60 focus-within:bg-white/10 transition-all duration-200">
            <Lock size={18} className="text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500 text-sm"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#A3E635] text-black font-semibold hover:scale-[1.01] active:scale-95 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Switch to Register */}
        <p className="text-gray-400 text-sm text-center mt-4">
          Don’t have an account?{" "}
          <button
            onClick={switchToRegister}
            className="text-[#A3E635] hover:underline"
            type="button"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}