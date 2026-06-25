package com.example.app_project.controller;

import com.example.app_project.dto.UserRequestDto;
import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserRequestDto request) {
        try {
            return ResponseEntity.ok(userService.signup(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(userService.getMyProfile(email));
    }

    @PutMapping("/nickname")
    public ResponseEntity<?> updateNickname(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        String newNickname = body.get("nickname");
        try {
            userService.updateNickname(email, newNickname);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "아이디가 변경되었습니다."));
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "비밀번호를 입력해 주세요."));
        }
        try {
            userService.updatePassword(email, newPassword);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(
            @RequestHeader("Authorization") String token,
            @RequestBody(required = false) Map<String, String> body) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        String password = body != null ? body.get("password") : null;
        try {
            userService.deleteAccount(email, password);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
    }
}