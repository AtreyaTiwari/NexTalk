package com.nextalk.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatListResponse {

    private Long chatId;
    private String chatType;

    private String otherUserName;
    private String otherUserMobile;
}