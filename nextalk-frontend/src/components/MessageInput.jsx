import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import api from "../api/axios";

export default function MessageInput({
  chatId,
  onMessageSent,
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);

  const canEmitRef = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setMe(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadMe();

    return () => clearTimeout(timerRef.current);
  }, []);

  const emitTyping = async () => {
    if (!me || !canEmitRef.current) return;

    canEmitRef.current = false;

    try {
      await api.post("/chat/typing", {
        chatId,
        senderId: me.id,
        senderName: me.name,
      });
    } catch (error) {
      console.error(error);
    }

    timerRef.current = setTimeout(() => {
      canEmitRef.current = true;
    }, 700);
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    emitTyping();
  };

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
      console.error(error);
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
        onChange={handleChange}
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