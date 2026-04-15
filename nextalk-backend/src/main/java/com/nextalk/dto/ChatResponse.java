package com.nextalk.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private Long chatId;
    private String chatType;
}