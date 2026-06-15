package com.example.app_project.controller;

import com.example.app_project.dto.StatResponseDto;
import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.service.StatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatController {

    private final StatService statService;
    private final JwtTokenProvider jwtTokenProvider;

    // 주간 통계
    @GetMapping("/weekly")
    public ResponseEntity<StatResponseDto> getWeeklyStat(
            @RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(statService.getWeeklyStat(email));
    }

    // 월간 통계
    @GetMapping("/monthly")
    public ResponseEntity<StatResponseDto> getMonthlyStat(
            @RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(statService.getMonthlyStat(email));
    }
}