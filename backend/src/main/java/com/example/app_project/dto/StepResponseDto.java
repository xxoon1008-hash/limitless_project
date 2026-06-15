package com.example.app_project.dto;

import com.example.app_project.domain.Step;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class StepResponseDto {

    private Long id;
    private int stepCount;
    private double distance;
    private double calories;
    private LocalDate recordedAt;

    public StepResponseDto(Step step) {
        this.id = step.getId();
        this.stepCount = step.getStepCount();
        this.distance = step.getDistance();
        this.calories = step.getCalories();
        this.recordedAt = step.getRecordedAt();
    }
}