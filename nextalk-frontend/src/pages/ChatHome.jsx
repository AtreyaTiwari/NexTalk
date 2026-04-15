import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatHome({ onLogout }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchChats = async () => {
    setLoading(true);

    try {
      const response = await api.get("/chat");
      setChats(response.data);
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleChatDeleted = (chatId) => {
    const updatedChats = chats.filter(
      (chat) => chat.chatId !== chatId
    );

    setChats(updatedChats);

    if (selectedChat?.chatId === chatId) {
      setSelectedChat(null);
    }
  };

  const filteredChats = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) return chats;

    return chats.filter((chat) =>
      chat.otherUserName?.toLowerCase().includes(keyword) ||
      chat.otherUserMobile?.includes(keyword)
    );
  }, [chats, searchTerm]);

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      <Sidebar
        chats={filteredChats}
        loading={loading}
        onLogout={onLogout}
        onRefreshChats={fetchChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <ChatWindow
        selectedChat={selectedChat}
        onChatDeleted={handleChatDeleted}
      />
    </div>
  );
}