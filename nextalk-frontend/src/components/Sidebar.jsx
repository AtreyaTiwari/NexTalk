import { useState } from "react";
import Logo from "./Logo";
import {
  Search,
  LogOut,
  Plus,
  User,
} from "lucide-react";

import api from "../api/axios";
import NewChatModal from "./NewChatModal";
import ProfileModal from "./ProfileModal";

export default function Sidebar({
  chats,
  loading,
  onLogout,
  onRefreshChats,
  selectedChat,
  onSelectChat,
  searchTerm,
  onSearchChange,
  typingMap,
}) {
  const [openModal, setOpenModal] = useState(false);
  const [openProfile, setOpenProfile] =
    useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] =
    useState(false);

  const handleOpenProfile = async () => {
    setOpenProfile(true);
    setProfileLoading(true);

    try {
      const response = await api.get("/auth/me");
      setProfile(response.data);
    } catch (error) {
      console.error(
        "Failed to load profile",
        error
      );
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <div className="w-[360px] border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenModal(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition"
            >
              <Plus size={18} />
            </button>

            <button
              onClick={handleOpenProfile}
              className="p-2 rounded-xl hover:bg-white/10 transition"
            >
              <User size={18} />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-white/10 transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
            <Search
              size={18}
              className="text-gray-400"
            />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
              className="bg-transparent outline-none w-full text-sm placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 px-3 pb-3 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-sm text-gray-400 px-2">
              Loading chats...
            </p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-gray-400 px-2">
              No chats found
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chatId}
                onClick={() => onSelectChat(chat)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedChat?.chatId ===
                  chat.chatId
                    ? "bg-white/15 border-[#A3E635]/40"
                    : "bg-white/5 hover:bg-white/10 border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#A3E635] text-black flex items-center justify-center font-bold">
                    {chat.otherUserName
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {chat.otherUserName}
                    </h3>

                    <p className="text-xs text-gray-400 truncate">
                      {typingMap?.[chat.chatId]
                        ? "Typing..."
                        : chat.otherUserMobile}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onChatCreated={onRefreshChats}
      />

      <ProfileModal
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
        profile={profile}
        loading={profileLoading}
      />
    </>
  );
}