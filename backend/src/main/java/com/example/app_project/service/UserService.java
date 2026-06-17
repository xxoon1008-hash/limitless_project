package com.example.app_project.service;

import com.example.app_project.domain.Role;
import com.example.app_project.domain.User;
import com.example.app_project.dto.UserRequestDto;
import com.example.app_project.dto.UserResponseDto;
import com.example.app_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional
    public UserResponseDto signup(UserRequestDto request) {
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        user.updatePassword(passwordEncoder.encode(newPassword));
    }

    // 회원 탈퇴
    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        userRepository.delete(user);
    }
}