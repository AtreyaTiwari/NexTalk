package com.nextalk.controller;

import com.nextalk.dto.LoginRequest;
import com.nextalk.dto.RegisterRequest;
import com.nextalk.dto.UserProfileResponse;
import com.nextalk.entity.User;
import com.nextalk.repository.UserRepository;
import com.nextalk.service.AuthService;
import com.nextalk.util.CurrentUserUtil;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final CurrentUserUtil currentUserUtil;

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          CurrentUserUtil currentUserUtil) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.currentUserUtil = currentUserUtil;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser() {

        String mobile = currentUserUtil.getCurrentUserMobile();

        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .mobile(user.getMobile())
                .createdAt(user.getCreatedAt())
                .build();
    }
}