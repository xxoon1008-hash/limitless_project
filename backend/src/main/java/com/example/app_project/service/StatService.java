//통계
package com.example.app_project.service;

import com.example.app_project.domain.User;
import com.example.app_project.dto.StatResponseDto;
import com.example.app_project.repository.StepRepository;
import com.example.app_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatService {

    private final StepRepository stepRepository;
    private final UserRepository userRepository;

    // 주간 통계
    public StatResponseDto getWeeklyStat(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        return getStat(user, start, end, "주간");
    }

    // 월간 통계
    public StatResponseDto getMonthlyStat(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);

        return getStat(user, start, end, "월간");
    }

    // 공통 통계 계산
    private StatResponseDto getStat(User user, LocalDate start, LocalDate end, String period) {
        Integer totalSteps = stepRepository.sumStepCountByUserAndDateBetween(user, start, end);
        Double totalDistance = stepRepository.sumDistanceByUserAndDateBetween(user, start, end);
        Double totalCalories = stepRepository.sumCaloriesByUserAndDateBetween(user, start, end);

        // null 처리 (데이터 없을 때)
        int steps = totalSteps != null ? totalSteps : 0;
        double distance = totalDistance != null ? totalDistance : 0.0;
        double calories = totalCalories != null ? totalCalories : 0.0;

        // 일평균 걸음 수
        long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        int dailyAvg = (int) (steps / days);

        return StatResponseDto.builder()
                .totalSteps(steps)
                .totalDistance(Math.round(distance * 100.0) / 100.0)
                .totalCalories(Math.round(calories * 100.0) / 100.0)
                .dailyAvgSteps(dailyAvg)
                .period(period)
                .build();
    }
}