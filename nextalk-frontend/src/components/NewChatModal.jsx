import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";

export default function NewChatModal({
  isOpen,
  onClose,
  onChatCreated,
}) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter valid mobile number");
      return;
    }

    setLoading(true);

    try {
      await api.post("/chat/private", { mobile });

      setMobile("");
      onChatCreated();
      onClose();

    } catch (err) {
      const status = err?.response?.status;
      const backendMessage = err?.response?.data;

      const text =
        typeof backendMessage === "string"
          ? backendMessage.toLowerCase()
          : "";

      if (
        text.includes("not found") ||
        text.includes("user not found") ||
        text.includes("this mobile") ||
        status === 404
      ) {
        setError("User Does Not Exist");
      } else {
        setError("Failed to create chat");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 text-white">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">New Chat</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#A3E635] text-black font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Start Chat"}
          </button>
        </form>
      </div>
    </div>
  );
}