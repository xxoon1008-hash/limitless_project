package com.example.app_project.controller;

import com.example.app_project.dto.UserRequestDto;
import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.repository.UserRepository;
import com.example.app_project.domain.User;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRequestDto request) {
        // 이메일 또는 닉네임으로 유저 조회
        User user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByNickname(request.getEmail()))
                .orElse(null);

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

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "서버 정상 작동 중!"));
    }
}