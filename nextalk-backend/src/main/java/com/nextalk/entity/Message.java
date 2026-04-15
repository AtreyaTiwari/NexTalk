package com.nextalk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Chat reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    // 👤 Sender
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // 💬 Message content
    @Column(nullable = false)
    private String content;

    // 🌍 Delete for everyone
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeleteType deleteType = DeleteType.NONE;

    // ⏱ Timestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.deleteType == null) {
            this.deleteType = DeleteType.NONE;
        }
    }
}