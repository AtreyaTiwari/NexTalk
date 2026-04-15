package com.nextalk.repository;

import com.nextalk.entity.MessageVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageVisibilityRepository
        extends JpaRepository<MessageVisibility, Long> {

    List<MessageVisibility> findByUserId(Long userId);

    boolean existsByMessageIdAndUserId(Long messageId, Long userId);
}