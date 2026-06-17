package com.example.app_project.repository;

import com.example.app_project.domain.Attendance;
import com.example.app_project.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    boolean existsByUserAndDate(User user, LocalDate date);
    List<Attendance> findByUserOrderByDateDesc(User user);
    void deleteAllByUser(User user);
}
