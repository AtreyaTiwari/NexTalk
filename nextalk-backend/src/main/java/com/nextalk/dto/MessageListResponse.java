package com.nextalk.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageListResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;

    private Long senderId;
    private String senderName;
}