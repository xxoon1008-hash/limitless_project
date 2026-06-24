package com.example.app_project.controller;

import com.example.app_project.domain.FoodRecord;
import com.example.app_project.domain.User;
import com.example.app_project.jwt.JwtTokenProvider;
import com.example.app_project.repository.FoodRecordRepository;
import com.example.app_project.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodController {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final String SYSTEM_PROMPT =
            "You are a nutrition expert. Your ONLY job is to analyze food items. " +
            "First, determine if the input is a real food or beverage name. " +
            "If the input is NOT a food or beverage (e.g. a person's name, place, object, random text, question, or anything that is not edible), " +
            "respond ONLY with this exact JSON: {\"error\":\"not_food\"} — no other text. " +
            "If it IS a food or beverage, respond ONLY with a valid JSON object in this exact format with no extra text: " +
            "{\"foodName\":\"음식 이름 (한국어)\",\"calories\":숫자,\"protein\":숫자,\"carbs\":숫자,\"fat\":숫자,\"servingSize\":\"1인분 기준\"} " +
            "All nutrient values are in grams (g), calories in kcal. Base on a typical single serving.";

    private final FoodRecordRepository foodRecordRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // AI 칼로리 분석
    @PostMapping("/calories")
    public ResponseEntity<?> getCalories(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "query가 필요합니다."));
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", new Object[]{
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", query)
                    },
                    "temperature", 0.1,
                    "max_tokens", 300
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Groq API 오류: " + response.statusCode()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").get(0).path("message").path("content").asText().trim();

            int start = content.indexOf('{');
            int end = content.lastIndexOf('}') + 1;
            if (start == -1 || end == 0) {
                return ResponseEntity.internalServerError().body(Map.of("error", "AI 응답 파싱 실패"));
            }

            JsonNode ai = objectMapper.readTree(content.substring(start, end));

            if (ai.has("error") && "not_food".equals(ai.get("error").asText())) {
                return ResponseEntity.badRequest().body(Map.of("error", "음식 이름을 입력해 주세요."));
            }

            Map<String, Object> foodData = Map.of(
                    "foodName",    firstText(ai, "foodName", "food_name", "name"),
                    "calories",    firstNum(ai, "calories", "calorie", "kcal"),
                    "protein",     firstNum(ai, "protein"),
                    "carbs",       firstNum(ai, "carbs", "carbohydrates", "carbohydrate"),
                    "fat",         firstNum(ai, "fat", "fats"),
                    "servingSize", firstText(ai, "servingSize", "serving_size", "serving")
            );
            return ResponseEntity.ok(foodData);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "칼로리 분석 실패: " + e.getMessage()));
        }
    }

    // 식단 기록 저장
    @PostMapping("/record")
    public ResponseEntity<?> saveRecord(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        String dateStr = (String) request.get("date");
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();

        Double latitude = toDoubleOrNull(request.get("latitude"));
        Double longitude = toDoubleOrNull(request.get("longitude"));

        FoodRecord record = FoodRecord.builder()
                .user(user)
                .recordedAt(date)
                .foodName((String) request.get("foodName"))
                .calories(toDouble(request.get("calories")))
                .protein(toDouble(request.get("protein")))
                .carbs(toDouble(request.get("carbs")))
                .fat(toDouble(request.get("fat")))
                .servingSize((String) request.get("servingSize"))
                .latitude(latitude)
                .longitude(longitude)
                .build();

        foodRecordRepository.save(record);
        return ResponseEntity.ok(Map.of("message", "저장 완료"));
    }

    // 날짜별 섭취 칼로리 합계 조회
    @GetMapping("/record")
    public ResponseEntity<?> getRecord(
            @RequestHeader("Authorization") String token,
            @RequestParam String date) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        LocalDate localDate = LocalDate.parse(date);
        List<FoodRecord> records = foodRecordRepository.findByUserAndRecordedAt(user, localDate);

        double totalCalories = records.stream().mapToDouble(FoodRecord::getCalories).sum();

        return ResponseEntity.ok(Map.of(
                "date", date,
                "totalCalories", (int) totalCalories,
                "records", records.stream().map(r -> {
                    java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("foodName", r.getFoodName());
                    m.put("calories", r.getCalories());
                    m.put("protein", r.getProtein());
                    m.put("carbs", r.getCarbs());
                    m.put("fat", r.getFat());
                    m.put("servingSize", r.getServingSize() != null ? r.getServingSize() : "");
                    m.put("latitude", r.getLatitude());
                    m.put("longitude", r.getLongitude());
                    return m;
                }).toList()
        ));
    }

    // 위치가 있는 식단 기록 전체 조회 (지도용)
    @GetMapping("/record/locations")
    public ResponseEntity<?> getRecordLocations(
            @RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        List<FoodRecord> all = foodRecordRepository.findByUser(user);

        List<java.util.Map<String, Object>> locations = all.stream()
                .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                .map(r -> {
                    java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("foodName", r.getFoodName());
                    m.put("calories", r.getCalories());
                    m.put("recordedAt", r.getRecordedAt().toString());
                    m.put("latitude", r.getLatitude());
                    m.put("longitude", r.getLongitude());
                    return m;
                }).toList();

        return ResponseEntity.ok(locations);
    }

    private String firstText(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode n = node.get(key);
            if (n != null && !n.isNull()) return n.asText();
        }
        return "";
    }

    private double firstNum(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode n = node.get(key);
            if (n != null && !n.isNull() && n.isNumber()) return n.asDouble();
        }
        return 0;
    }

    private double toDouble(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return 0; }
    }

    private Double toDoubleOrNull(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return null; }
    }
}
