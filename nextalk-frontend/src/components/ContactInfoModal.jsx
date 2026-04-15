import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import api from "../api/axios";

export default function ContactInfoModal({
  isOpen,
  onClose,
  contact,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const firstLetter =
    contact?.otherUserName?.charAt(0)?.toUpperCase() || "?";

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this chat for you?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await api.delete(`/chat/${contact.chatId}`);

      onClose();
      onDeleted?.(contact.chatId);
    } catch (error) {
      console.error("Failed to delete chat", error);
      alert("Failed to delete chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Contact Info
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#A3E635] text-black text-3xl font-bold flex items-center justify-center mb-4">
            {firstLetter}
          </div>

          <h3 className="text-xl font-semibold">
            {contact?.otherUserName}
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            {contact?.otherUserMobile}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-400">About</p>
            <p className="text-sm">
              Hey there! I'm using NexTalk.
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Last Seen</p>
            <p className="text-sm">Recently active</p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Status</p>
            <p className="text-sm text-[#A3E635]">
              Available
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 border border-red-500/30 py-3 text-red-400 hover:bg-red-500/20"
        >
          <Trash2 size={16} />
          {loading ? "Deleting..." : "Delete Chat"}
        </button>
      </div>
    </div>
  );
}