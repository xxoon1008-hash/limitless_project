package com.example.app_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AppProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppProjectApplication.class, args);
	}

}

//step-controller   → 걸음 수 API 4개
//stat-controller   → 통계 API 2개
//auth-controller   → 인증 API
//user-controller   → 유저 API

// 구글 로그인
// GET  /api/auth/token       → JWT 토큰 발급
// GET  /api/auth/test        → 서버 테스트

// 마이페이지
// GET  /api/users/me         → 내 프로필 조회
// PATCH /api/users/weight    → 체중 업데이트

// 걸음 수
// POST /api/steps            → 걸음 수 저장
// GET  /api/steps/today      → 오늘 걸음 수 + 칼로리
// GET  /api/steps/weekly     → 주간 걸음 수
// GET  /api/steps/history    → 전체 히스토리

// 통계
// GET  /api/stats/weekly     → 주간 통계
// GET  /api/stats/monthly    → 월간 통계