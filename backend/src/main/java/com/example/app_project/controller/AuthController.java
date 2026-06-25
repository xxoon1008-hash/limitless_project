package com.example.app_project.controller;

import com.example.app_project.dto.UserRequestDto;
import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.repository.UserRepository;
import com.example.app_project.domain.User;
import com.example.app_project.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRequestDto request) {
        // 이메일 또는 닉네임으로 유저 조회
        User user = null;
        if (request.getEmail() != null) {
            user = userRepository.findByEmail(request.getEmail()).orElse(null);
        }
        if (user == null && request.getNickname() != null) {
            user = userRepository.findByNickname(request.getNickname()).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일 또는 비밀번호가 올바르지 않습니다."));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일 또는 비밀번호가 올바르지 않습니다."));
        }

        String token = jwtTokenProvider.generateToken(
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of())
        );

        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/token")
    public ResponseEntity<?> getToken(@RequestParam String token) {
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일을 입력해 주세요."));
        }
        try {
            emailVerificationService.sendCode(email);
            return ResponseEntity.ok(Map.of("message", "인증번호가 발송되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "서버 정상 작동 중!"));
    }
}