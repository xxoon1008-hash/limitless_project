package com.example.app_project.repository;

import com.example.app_project.domain.Step;
import com.example.app_project.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StepRepository extends JpaRepository<Step, Long> {

    // 오늘 걸음 수 조회
    Optional<Step> findByUserAndRecordedAt(User user, LocalDate recordedAt);

    // 주간 걸음 수 조회
    List<Step> findByUserAndRecordedAtBetween(User user, LocalDate start, LocalDate end);

    // 전체 히스토리 조회
    List<Step> findByUserOrderByRecordedAtDesc(User user);

    // 주간 총 걸음 수
    @Query("SELECT SUM(s.stepCount) FROM Step s WHERE s.user = :user AND s.recordedAt BETWEEN :start AND :end")
    Integer sumStepCountByUserAndDateBetween(@Param("user") User user,
                                             @Param("start") LocalDate start,
                                             @Param("end") LocalDate end);

    // 총 칼로리 합계
    @Query("SELECT SUM(s.calories) FROM Step s WHERE s.user = :user AND s.recordedAt BETWEEN :start AND :end")
    Double sumCaloriesByUserAndDateBetween(@Param("user") User user,
                                           @Param("start") LocalDate start,
                                           @Param("end") LocalDate end);

    // 총 거리 합계
    @Query("SELECT SUM(s.distance) FROM Step s WHERE s.user = :user AND s.recordedAt BETWEEN :start AND :end")
    Double sumDistanceByUserAndDateBetween(@Param("user") User user,
                                           @Param("start") LocalDate start,
                                           @Param("end") LocalDate end);
}