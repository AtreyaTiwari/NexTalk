import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function ChatHome({ onLogout }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingMap, setTypingMap] = useState({});
  const [me, setMe] = useState(null);

  const stompClientRef = useRef(null);
  const typingTimersRef = useRef({});

  const fetchChats = async () => {
    setLoading(true);

    try {
      const [chatRes, meRes] = await Promise.all([
        api.get("/chat"),
        api.get("/auth/me"),
      ]);

      setChats(chatRes.data);
      setMe(meRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chats.length === 0 || !me) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL}/ws`
        ),

      reconnectDelay: 5000,

      onConnect: () => {
        chats.forEach((chat) => {
          client.subscribe(
            `/topic/chat/${chat.chatId}/typing`,
            (message) => {
              const data = JSON.parse(message.body);

              if (data.senderId === me.id) return;

              setTypingMap((prev) => ({
                ...prev,
                [chat.chatId]: true,
              }));

              clearTimeout(
                typingTimersRef.current[chat.chatId]
              );

              typingTimersRef.current[chat.chatId] =
                setTimeout(() => {
                  setTypingMap((prev) => ({
                    ...prev,
                    [chat.chatId]: false,
                  }));
                }, 1000);
            }
          );
        });
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      Object.values(
        typingTimersRef.current
      ).forEach(clearTimeout);

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [chats, me]);

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
      chat.otherUserName
        ?.toLowerCase()
        .includes(keyword) ||
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
        typingMap={typingMap}
      />

      <ChatWindow
        selectedChat={selectedChat}
        onChatDeleted={handleChatDeleted}
        onCloseChat={() => setSelectedChat(null)}
        isTyping={
          selectedChat
            ? typingMap[selectedChat.chatId]
            : false
        }
      />
    </div>
  );
}