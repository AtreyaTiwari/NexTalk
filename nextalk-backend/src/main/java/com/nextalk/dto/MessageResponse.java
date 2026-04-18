package com.nextalk.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;

    private Long chatId;

    private Long senderId;
    private String senderName;

    private boolean delivered;
    private boolean seen;
}