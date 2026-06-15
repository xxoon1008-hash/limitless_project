# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Limitless** is a fitness/health tracking app (Korean-language UI) consisting of:
- **Frontend**: Expo (React Native) mobile app targeting iOS/Android
- **Backend**: Spring Boot 4 REST API with PostgreSQL (prod) / MySQL (local dev)

The production backend is deployed on Render at `https://limitless-project.onrender.com`. The frontend hardcodes this URL in `src/app/index.tsx` as `API_URL`.

## Backend (Spring Boot)

**Location**: `backend/`  
**Java version**: 17  
**Build tool**: Gradle (Wrapper included)

### Commands

```bash
# Run locally
cd backend && ./gradlew bootRun

# Build JAR (skip tests)
cd backend && ./gradlew build -x test

# Run tests
cd backend && ./gradlew test

# Run a single test class
cd backend && ./gradlew test --tests "com.example.app_project.AppProjectApplicationTests"
```

### Architecture

```
src/main/java/com/example/app_project/
  config/          # SecurityConfig (JWT + OAuth2), CustomAuthorizationRequestResolver
  controller/      # AuthController, UserController, StepController, StatController
  domain/          # JPA entities: User, Step, Role
  dto/             # Request/Response DTOs
  jwt/             # JwtTokenProvider (JJWT 0.11.5)
  repository/      # Spring Data JPA repositories
  service/         # OAuth2UserService, UserService, StepService, StatService
```

**Auth flow**: Stateless JWT. Google OAuth2 via Spring Security — on success, redirects to `myapp://redirect?token=<jwt>` (deep link picked up by the mobile app). Local login via `POST /api/auth/login` accepts email or nickname + password.

**Security**: `/api/auth/**` and `/api/users/signup` are public. All other endpoints require `Authorization: Bearer <token>`. Swagger UI is also public at `/swagger-ui/**`.

**Profiles**:
- Default (`application.yml`): MySQL at `localhost:3306/project`
- Prod (`application-prod.yml`): PostgreSQL on Render (activated via `SPRING_PROFILES_ACTIVE=prod`)

**Required env vars**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`

### Docker

```bash
cd backend && docker build -t limitless-backend .
docker run -e SPRING_PROFILES_ACTIVE=prod -e GOOGLE_CLIENT_ID=... -e GOOGLE_CLIENT_SECRET=... -e JWT_SECRET=... -p 8080:8080 limitless-backend
```

## Frontend (Expo / React Native)

**Location**: `frontend/`  
**Expo version**: ~56 — **always check versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing Expo-specific code.**

### Commands

```bash
cd frontend && npm install

# Start Expo dev server (choose platform interactively)
cd frontend && npm start

# Run on specific platform
cd frontend && npm run ios
cd frontend && npm run android
cd frontend && npm run web

# Lint
cd frontend && npm run lint
```

### Architecture

**Router**: `expo-router` with file-based routing under `src/app/`. The entry layout (`src/app/_layout.tsx`) registers `index` (login) and `signup` as the root stack. Screens outside the stack (`main`, `kakaomap`, `mypage`) are navigated to via `router.replace`/`router.push`.

**Screens**:
- `src/app/index.tsx` — Login (email/password + Google OAuth2 via WebBrowser deep link)
- `src/app/signup.tsx` — Registration
- `src/app/main.tsx` — Home dashboard: workout calendar, attendance check, calorie tracking modal
- `src/app/kakaomap.tsx` — Map view
- `src/app/mypage.tsx` — User profile

**Styles**: Each screen has a corresponding file in `src/style/` (e.g., `main_styles.ts`). Platform-specific component variants use the `.web.tsx` suffix (e.g., `app-tabs.web.tsx`).

**Token storage**: JWT is stored in `AsyncStorage` (key: `jwt_token`). `src/services/auth.ts` also provides `SecureStore`-based helpers (not currently used by screens — screens use AsyncStorage directly).

**API base URL**: Hardcoded as `const API_URL = "https://limitless-project.onrender.com"` in `src/app/index.tsx`. Other screens that need API calls should reference this same URL.

**Deep linking scheme**: `myapp://` — used to receive the JWT token after Google OAuth2 redirect from the backend.
