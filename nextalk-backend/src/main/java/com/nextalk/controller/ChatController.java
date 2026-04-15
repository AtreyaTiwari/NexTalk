package com.nextalk.controller;

import com.nextalk.dto.*;
import com.nextalk.entity.Chat;
import com.nextalk.entity.Message;
import com.nextalk.entity.User;
import com.nextalk.repository.UserRepository;
import com.nextalk.service.ChatService;
import com.nextalk.util.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping("/private")
    public ChatResponse createPrivateChat(
            @Valid @RequestBody CreatePrivateChatRequest request) {

        String currentUserMobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(currentUserMobile)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        User otherUser = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() ->
                        new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND,
                                "User not found with this mobile"
                        )
                );

        Chat chat = chatService.createPrivateChat(
                currentUser.getId(),
                otherUser.getId()
        );

        return ChatResponse.builder()
                .chatId(chat.getId())
                .chatType(chat.getChatType().name())
                .build();
    }

    @GetMapping
    public List<ChatListResponse> getChats() {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return chatService.getUserChats(currentUser.getId());
    }

    @PostMapping("/message")
    public MessageResponse sendMessage(
            @Valid @RequestBody SendMessageRequest request) {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Message message = chatService.sendMessage(
                currentUser.getId(),
                request.getChatId(),
                request.getContent()
        );

        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .chatId(message.getChat().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .build();
    }

    @GetMapping("/{chatId}/messages")
    public List<MessageListResponse> getMessages(
            @PathVariable Long chatId) {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return chatService.getMessages(
                currentUser.getId(),
                chatId
        );
    }

    @DeleteMapping("/{chatId}")
    public void deleteChatForMe(
            @PathVariable Long chatId) {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        chatService.deleteChatForMe(
                currentUser.getId(),
                chatId
        );
    }

    @DeleteMapping("/message/{messageId}/me")
    public void deleteMessageForMe(
            @PathVariable Long messageId) {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        chatService.deleteMessageForMe(
                currentUser.getId(),
                messageId
        );
    }

    @DeleteMapping("/message/{messageId}/everyone")
    public void deleteMessageForEveryone(
            @PathVariable Long messageId) {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User currentUser = userRepository.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        chatService.deleteMessageForEveryone(
                currentUser.getId(),
                messageId
        );
    }
}