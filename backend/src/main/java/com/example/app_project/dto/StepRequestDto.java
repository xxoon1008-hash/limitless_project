//걸음 수 api
package com.example.app_project.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StepRequestDto {

    private int stepCount;   // 걸음 수
    private double distance; // 이동 거리 (km)
}