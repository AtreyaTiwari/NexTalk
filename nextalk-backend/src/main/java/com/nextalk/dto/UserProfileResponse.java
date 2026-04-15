package com.nextalk.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserProfileResponse {

    private Long id;
    private String name;
    private String mobile;
    private LocalDateTime createdAt;
}