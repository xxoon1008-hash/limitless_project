package com.example.app_project.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "food_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FoodRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate recordedAt;

    @Column(nullable = false)
    private String foodName;

    @Column(nullable = false)
    private double calories;

    @Column
    private double protein;

    @Column
    private double carbs;

    @Column
    private double fat;

    @Column
    private String servingSize;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Builder
    public FoodRecord(User user, LocalDate recordedAt, String foodName,
                      double calories, double protein, double carbs, double fat, String servingSize,
                      Double latitude, Double longitude) {
        this.user = user;
        this.recordedAt = recordedAt;
        this.foodName = foodName;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
        this.servingSize = servingSize;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
