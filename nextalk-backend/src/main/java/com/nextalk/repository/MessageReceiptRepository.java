package com.nextalk.repository;

import com.nextalk.entity.MessageReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageReceiptRepository
        extends JpaRepository<MessageReceipt, Long> {

    Optional<MessageReceipt> findByMessageIdAndUserId(
            Long messageId,
            Long userId
    );

    List<MessageReceipt> findByUserIdAndMessageChatIdAndSeenAtIsNull(
            Long userId,
            Long chatId
    );
}