package com.example.app_project.service;

import com.example.app_project.domain.Role;
import com.example.app_project.domain.User;
import com.example.app_project.dto.UserRequestDto;
import com.example.app_project.dto.UserResponseDto;
import com.example.app_project.repository.AttendanceRepository;
import com.example.app_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    private void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new RuntimeException("올바른 이메일 형식을 입력해 주세요.");
        }
    }

    private void validatePassword(String password) {
        if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
            throw new RuntimeException("비밀번호는 8자 이상이며 특수문자를 포함해야 합니다.");
        }
    }

    // 회원가입
    @Transactional
    public UserResponseDto signup(UserRequestDto request) {
        validateEmail(request.getEmail());
        validatePassword(request.getPassword());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .provider("local")
                .build();

        userRepository.save(user);
        return new UserResponseDto(user);
    }

    // 내 프로필 조회
    public UserResponseDto getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        return new UserResponseDto(user);
    }

    // 체중 업데이트
    @Transactional
    public UserResponseDto updateWeight(String email, Double weight) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        user.updateWeight(weight);
        return new UserResponseDto(user);
    }

    // 비밀번호 변경
    @Transactional
    public void updatePassword(String email, String newPassword) {
        validatePassword(newPassword);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        user.updatePassword(passwordEncoder.encode(newPassword));
    }

    // 회원 탈퇴
    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        attendanceRepository.deleteAllByUser(user);
        userRepository.delete(user);
    }
}