//걸음 수 api
package com.example.app_project.controller;

import com.example.app_project.dto.StepRequestDto;
import com.example.app_project.dto.StepResponseDto;
import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.service.StepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/steps")
@RequiredArgsConstructor
public class StepController {

    private final StepService stepService;
    private final JwtTokenProvider jwtTokenProvider;

    // 걸음 수 저장
    @PostMapping
    public ResponseEntity<StepResponseDto> saveSteps(
            @RequestHeader("Authorization") String token,
            @RequestBody StepRequestDto requestDto) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(stepService.saveSteps(email, requestDto));
    }

    // 오늘 걸음 수 조회
    @GetMapping("/today")
    public ResponseEntity<StepResponseDto> getTodaySteps(
            @RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(stepService.getTodaySteps(email));
    }

    // 주간 걸음 수 조회
    @GetMapping("/weekly")
    public ResponseEntity<List<StepResponseDto>> getWeeklySteps(
            @RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(stepService.getWeeklySteps(email));
    }

    // 전체 히스토리 조회
    @GetMapping("/history")
    public ResponseEntity<List<StepResponseDto>> getHistory(
            @RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(stepService.getHistory(email));
    }
}