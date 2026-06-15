//통계
package com.example.app_project.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatResponseDto {

    private int totalSteps;       // 총 걸음 수
    private double totalDistance; // 총 거리 (km)
    private double totalCalories; // 총 칼로리
    private int dailyAvgSteps;    // 일평균 걸음 수
    private String period;        // 기간 (주간/월간)
}