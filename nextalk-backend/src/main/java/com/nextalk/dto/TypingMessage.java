package com.nextalk.dto;

public class TypingMessage {

    private Long chatId;
    private Long senderId;
    private String senderName;

    public TypingMessage() {
    }

    public TypingMessage(Long chatId, Long senderId, String senderName) {
        this.chatId = chatId;
        this.senderId = senderId;
        this.senderName = senderName;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
}