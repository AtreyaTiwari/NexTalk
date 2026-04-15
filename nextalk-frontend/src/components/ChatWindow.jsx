import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import MessageInput from "./MessageInput";
import ContactInfoModal from "./ContactInfoModal";
import { MoreVertical } from "lucide-react";

export default function ChatWindow({
  selectedChat,
  onChatDeleted,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    setLoading(true);

    try {
      const response = await api.get(
        `/chat/${selectedChat.chatId}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleMessageSent = () => {
    fetchMessages();
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}/me`);
      setActiveMenu(null);
      fetchMessages();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await api.delete(
        `/chat/message/${messageId}/everyone`
      );
      setActiveMenu(null);
      fetchMessages();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col bg-black">
        <div
          onClick={() => setOpenContact(true)}
          className="h-20 px-6 border-b border-white/10 flex items-center cursor-pointer hover:bg-white/5"
        >
          <div>
            <h2 className="font-semibold text-lg text-white">
              {selectedChat.otherUserName}
            </h2>
            <p className="text-sm text-gray-400">
              {selectedChat.otherUserMobile}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No messages yet
            </p>
          ) : (
            <>
              {messages.map((msg) => {
                const isMe =
                  msg.senderName !== selectedChat.otherUserName;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[70%] relative">
                      <div className="flex items-start gap-2">
                        {!isMe && (
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === msg.id
                                  ? null
                                  : msg.id
                              )
                            }
                            className="mt-1 text-gray-500 hover:text-white"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}

                        <div>
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm ${
                              isMe
                                ? "bg-[#A3E635] text-black"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            {msg.content}
                          </div>

                          <p
                            className={`text-[11px] mt-1 text-gray-500 ${
                              isMe
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>

                        {isMe && (
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === msg.id
                                  ? null
                                  : msg.id
                              )
                            }
                            className="mt-1 text-gray-500 hover:text-white"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      </div>

                      {activeMenu === msg.id && (
                        <div
                          className={`absolute top-8 z-20 w-44 rounded-2xl border border-white/10 bg-[#111] shadow-xl overflow-hidden ${
                            isMe
                              ? "right-0"
                              : "left-0"
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleDeleteForMe(msg.id)
                            }
                            className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
                          >
                            Delete for Me
                          </button>

                          {isMe && (
                            <button
                              onClick={() =>
                                handleDeleteForEveryone(
                                  msg.id
                                )
                              }
                              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5"
                            >
                              Delete for Everyone
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        <MessageInput
          chatId={selectedChat.chatId}
          onMessageSent={handleMessageSent}
        />
      </div>

      <ContactInfoModal
        isOpen={openContact}
        onClose={() => setOpenContact(false)}
        contact={selectedChat}
        onDeleted={onChatDeleted}
      />
    </>
  );
}