package com.nextalk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePrivateChatRequest {

    @NotBlank(message = "Mobile number is required")
    private String mobile;
}