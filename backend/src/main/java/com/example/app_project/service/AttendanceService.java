package com.example.app_project.service;

import com.example.app_project.domain.Attendance;
import com.example.app_project.domain.User;
import com.example.app_project.repository.AttendanceRepository;
import com.example.app_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Transactional
    public ResponseEntity<?> checkIn(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));

        if (attendanceRepository.existsByUserAndDate(user, today)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "오늘은 이미 출석 체크를 완료했습니다!"));
        }

        attendanceRepository.save(Attendance.builder().user(user).date(today).build());
        return ResponseEntity.ok(Map.of("message", "출석 체크가 완료되었습니다.", "date", today.toString()));
    }

    public List<String> getAttendanceDates(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        return attendanceRepository.findByUserOrderByDateDesc(user)
                .stream()
                .map(a -> a.getDate().toString())
                .collect(Collectors.toList());
    }
}
