import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import MessageInput from "./MessageInput";
import ContactInfoModal from "./ContactInfoModal";
import {
  MoreVertical,
  CheckCheck,
  X,
} from "lucide-react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function ChatWindow({
  selectedChat,
  onChatDeleted,
  onCloseChat,
  isTyping,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const messageContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const stompClientRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      const box = messageContainerRef.current;
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    }, 50);
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markChatSeen = async (chatId) => {
    try {
      await api.post(`/chat/${chatId}/seen`);
    } catch (error) {
      console.error("Seen update failed", error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    setLoading(true);

    try {
      const response = await api.get(
        `/chat/${selectedChat.chatId}/messages`
      );

      setMessages(response.data);
      await markChatSeen(selectedChat.chatId);
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
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.length, isTyping, selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseChat();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedChat, onCloseChat]);

  useEffect(() => {
    if (!selectedChat) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL}/ws`
        ),

      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe(
          `/topic/chat/${selectedChat.chatId}`,
          (message) => {
            const newMessage = JSON.parse(message.body);

            setMessages((prev) => {
              const exists = prev.some(
                (msg) => msg.id === newMessage.id
              );

              if (exists) return prev;

              return [...prev, newMessage];
            });

            const isFromOtherUser =
              newMessage.senderName ===
              selectedChat.otherUserName;

            if (isFromOtherUser) {
              markChatSeen(selectedChat.chatId);
            }
          }
        );

        client.subscribe(
          `/topic/chat/${selectedChat.chatId}/seen`,
          async () => {
            try {
              const response = await api.get(
                `/chat/${selectedChat.chatId}/messages`
              );
              setMessages(response.data);
            } catch (error) {
              console.error(error);
            }
          }
        );
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [selectedChat]);

  const handleMessageSent = () => {};

  const handleDeleteForMe = async (messageId) => {
    try {
      await api.delete(
        `/chat/message/${messageId}/me`
      );
      setActiveMenu(null);
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteForEveryone = async (
    messageId
  ) => {
    try {
      await api.delete(
        `/chat/message/${messageId}/everyone`
      );
      setActiveMenu(null);
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const renderStatus = (msg) => {
    return (
      <CheckCheck
        size={14}
        className={
          msg.seen
            ? "text-blue-400"
            : "text-gray-500"
        }
      />
    );
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
        <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between">
          <div
            onClick={() => setOpenContact(true)}
            className="cursor-pointer hover:opacity-80"
          >
            <h2 className="font-semibold text-lg text-white">
              {selectedChat.otherUserName}
            </h2>

            <p className="text-sm text-gray-400">
              {selectedChat.otherUserMobile}
            </p>
          </div>

          <button
            onClick={onCloseChat}
            className="p-2 rounded-full hover:bg-white/10 transition"
            title="Close chat (Esc)"
          >
            <X
              size={20}
              className="text-white"
            />
          </button>
        </div>

        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {loading ? (
            <p className="text-gray-400 text-sm">
              Loading...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No messages yet
            </p>
          ) : (
            <>
              {messages.map((msg) => {
                const isMe =
                  msg.senderName !==
                  selectedChat.otherUserName;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe
                        ? "justify-end"
                        : "justify-start"
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

                          <div
                            className={`flex items-center gap-1 text-[11px] mt-1 text-gray-500 ${
                              isMe
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <span>
                              {formatTime(
                                msg.createdAt
                              )}
                            </span>

                            {isMe &&
                              renderStatus(msg)}
                          </div>
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
                              handleDeleteForMe(
                                msg.id
                              )
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

              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-white text-black flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                </div>
              )}

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