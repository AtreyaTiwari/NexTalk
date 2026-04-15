package com.nextalk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"chat_id", "user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Chat Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    // 🔗 User Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 👤 Role in Chat
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ⏱ Joined Time
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    // 🗑 Soft delete (delete chat for me)
    @Column(nullable = false)
    private boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        this.joinedAt = LocalDateTime.now();
    }
}