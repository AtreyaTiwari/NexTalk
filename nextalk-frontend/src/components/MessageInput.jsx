import { useState } from "react";
import { Send } from "lucide-react";
import api from "../api/axios";

export default function MessageInput({
  chatId,
  onMessageSent,
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      await api.post("/chat/message", {
        chatId,
        content,
      });

      setContent("");
      onMessageSent();
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="p-4 border-t border-white/10 flex gap-3"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none text-white"
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 rounded-2xl bg-[#A3E635] text-black font-semibold disabled:opacity-60"
      >
        <Send size={18} />
      </button>
    </form>
  );
}