//걸음 수 api 칼로리
package com.example.app_project.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "steps")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Step {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int stepCount;

    @Column(nullable = false)
    private double distance;

    @Column(nullable = false)
    private double calories;   // ← distance 아래에 추가!

    @Column(nullable = false)
    private LocalDate recordedAt;

    @Column
    private LocalDateTime createdAt;

    @Builder
    public Step(User user, int stepCount, double distance, double calories, LocalDate recordedAt) {
        this.user = user;
        this.stepCount = stepCount;
        this.distance = distance;
        this.calories = calories;
        this.recordedAt = recordedAt;
        this.createdAt = LocalDateTime.now();
    }

    public void update(int stepCount, double distance, double calories) {
        this.stepCount = stepCount;
        this.distance = distance;
        this.calories = calories;
    }
}