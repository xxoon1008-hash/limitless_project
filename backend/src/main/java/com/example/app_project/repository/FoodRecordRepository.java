package com.example.app_project.repository;

import com.example.app_project.domain.FoodRecord;
import com.example.app_project.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FoodRecordRepository extends JpaRepository<FoodRecord, Long> {

    List<FoodRecord> findByUser(User user);

    List<FoodRecord> findByUserAndRecordedAt(User user, LocalDate recordedAt);

    void deleteAllByUser(User user);

    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodRecord f WHERE f.user = :user AND f.recordedAt = :date")
    double sumCaloriesByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
}
