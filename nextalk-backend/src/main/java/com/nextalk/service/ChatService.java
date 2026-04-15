package com.nextalk.service;

import com.nextalk.dto.ChatListResponse;
import com.nextalk.dto.MessageListResponse;
import com.nextalk.entity.*;
import com.nextalk.repository.ChatMemberRepository;
import com.nextalk.repository.ChatRepository;
import com.nextalk.repository.MessageRepository;
import com.nextalk.repository.MessageVisibilityRepository;
import com.nextalk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final MessageVisibilityRepository messageVisibilityRepository;

    @Transactional
    public Chat createPrivateChat(Long user1Id, Long user2Id) {

        if (user1Id.equals(user2Id)) {
            throw new RuntimeException("Cannot create chat with yourself");
        }

        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User1 not found"));

        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User2 not found"));

        List<ChatMember> user1Chats = chatMemberRepository.findByUserId(user1Id);

        for (ChatMember cm : user1Chats) {

            if (cm.isDeleted()) continue;

            Chat chat = cm.getChat();

            if (chat.getChatType() != ChatType.PRIVATE) continue;

            List<ChatMember> members = chatMemberRepository.findByChatId(chat.getId());

            if (members.size() != 2) continue;

            boolean hasUser2 = members.stream()
                    .anyMatch(m ->
                            !m.isDeleted() &&
                                    m.getUser().getId().equals(user2Id)
                    );

            if (hasUser2) {
                return chat;
            }
        }

        Chat chat = Chat.builder()
                .chatType(ChatType.PRIVATE)
                .build();

        chat = chatRepository.save(chat);

        ChatMember cm1 = ChatMember.builder()
                .chat(chat)
                .user(user1)
                .role(Role.ADMIN)
                .isDeleted(false)
                .build();

        ChatMember cm2 = ChatMember.builder()
                .chat(chat)
                .user(user2)
                .role(Role.ADMIN)
                .isDeleted(false)
                .build();

        chatMemberRepository.save(cm1);
        chatMemberRepository.save(cm2);

        return chat;
    }

    public List<ChatListResponse> getUserChats(Long userId) {

        List<ChatMember> chatMembers = chatMemberRepository.findByUserId(userId);

        return chatMembers.stream()
                .filter(cm -> !cm.isDeleted())
                .map(cm -> {

                    Chat chat = cm.getChat();

                    if (chat.getChatType() != ChatType.PRIVATE) return null;

                    List<ChatMember> members = chatMemberRepository.findByChatId(chat.getId());

                    ChatMember otherMember = members.stream()
                            .filter(m ->
                                    !m.getUser().getId().equals(userId) &&
                                            !m.isDeleted()
                            )
                            .findFirst()
                            .orElse(null);

                    if (otherMember == null) return null;

                    return ChatListResponse.builder()
                            .chatId(chat.getId())
                            .chatType(chat.getChatType().name())
                            .otherUserName(otherMember.getUser().getName())
                            .otherUserMobile(otherMember.getUser().getMobile())
                            .build();
                })
                .filter(obj -> obj != null)
                .toList();
    }

    @Transactional
    public Message sendMessage(Long userId, Long chatId, String content) {

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        List<ChatMember> members = chatMemberRepository.findByChatId(chatId);

        boolean isMember = members.stream()
                .anyMatch(m ->
                        m.getUser().getId().equals(userId) &&
                                !m.isDeleted()
                );

        if (!isMember) {
            throw new RuntimeException("User not part of this chat");
        }

        Message message = Message.builder()
                .chat(chat)
                .sender(sender)
                .content(content)
                .build();

        return messageRepository.save(message);
    }

    public List<MessageListResponse> getMessages(Long userId, Long chatId) {

        List<ChatMember> members = chatMemberRepository.findByChatId(chatId);

        boolean isMember = members.stream()
                .anyMatch(m ->
                        m.getUser().getId().equals(userId) &&
                                !m.isDeleted()
                );

        if (!isMember) {
            throw new RuntimeException("User not part of this chat");
        }

        List<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);

        return messages.stream()
                .filter(msg ->
                        !messageVisibilityRepository
                                .existsByMessageIdAndUserId(msg.getId(), userId)
                )
                .map(msg -> MessageListResponse.builder()
                        .id(msg.getId())
                        .content(
                                msg.getDeleteType() == DeleteType.EVERYONE
                                        ? "This message was deleted"
                                        : msg.getContent()
                        )
                        .createdAt(msg.getCreatedAt())
                        .senderId(msg.getSender().getId())
                        .senderName(msg.getSender().getName())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteChatForMe(Long userId, Long chatId) {

        ChatMember member = chatMemberRepository
                .findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Chat membership not found"));

        member.setDeleted(true);

        chatMemberRepository.save(member);
    }

    @Transactional
    public void deleteMessageForMe(Long userId, Long messageId) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        boolean alreadyHidden = messageVisibilityRepository
                .existsByMessageIdAndUserId(messageId, userId);

        if (alreadyHidden) return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MessageVisibility visibility = MessageVisibility.builder()
                .message(message)
                .user(user)
                .build();

        messageVisibilityRepository.save(visibility);
    }

    @Transactional
    public void deleteMessageForEveryone(Long userId, Long messageId) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Only sender can delete for everyone");
        }

        message.setDeleteType(DeleteType.EVERYONE);

        messageRepository.save(message);
    }
}