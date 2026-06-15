package com.example.app_project.service;

import com.example.app_project.domain.Step;
import com.example.app_project.domain.User;
import com.example.app_project.dto.StepRequestDto;
import com.example.app_project.dto.StepResponseDto;
import com.example.app_project.repository.StepRepository;
import com.example.app_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StepService {

    private final StepRepository stepRepository;
    private final UserRepository userRepository;

    // 칼로리 계산
    private double calculateCalories(int stepCount, Double weight) {
        if (weight == null || weight == 0) {
            return stepCount * 0.04;
        }
        return stepCount * weight * 0.0005;
    }

    // 걸음 수 저장
    @Transactional
    public StepResponseDto saveSteps(String email, StepRequestDto requestDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        LocalDate today = LocalDate.now();
        double calories = calculateCalories(requestDto.getStepCount(), user.getWeight());

        Step step = stepRepository.findByUserAndRecordedAt(user, today)
                .map(s -> {
                    s.update(requestDto.getStepCount(), requestDto.getDistance(), calories);
                    return s;
                })
                .orElse(Step.builder()
                        .user(user)
                        .stepCount(requestDto.getStepCount())
                        .distance(requestDto.getDistance())
                        .calories(calories)
                        .recordedAt(today)
                        .build());

        stepRepository.save(step);
        return new StepResponseDto(step);
    }

    // 오늘 걸음 수 조회
    public StepResponseDto getTodaySteps(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        Step step = stepRepository.findByUserAndRecordedAt(user, LocalDate.now())
                .orElse(Step.builder()
                        .user(user)
                        .stepCount(0)
                        .distance(0.0)
                        .calories(0.0)
                        .recordedAt(LocalDate.now())
                        .build());

        return new StepResponseDto(step);
    }

    // 주간 걸음 수 조회
    public List<StepResponseDto> getWeeklySteps(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        return stepRepository.findByUserAndRecordedAtBetween(user, start, end)
                .stream()
                .map(StepResponseDto::new)
                .collect(Collectors.toList());
    }

    // 전체 히스토리 조회
    public List<StepResponseDto> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        return stepRepository.findByUserOrderByRecordedAtDesc(user)
                .stream()
                .map(StepResponseDto::new)
                .collect(Collectors.toList());
    }
}