package com.nextalk.repository;

import com.nextalk.entity.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {

    // Get all chats of a user
    List<ChatMember> findByUserId(Long userId);

    // Get all members of a chat
    List<ChatMember> findByChatId(Long chatId);

    // Current user's membership in specific chat
    Optional<ChatMember> findByChatIdAndUserId(Long chatId, Long userId);
}