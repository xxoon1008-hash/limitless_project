package com.example.app_project.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/food")
public class FoodController {

    private static final String SYSTEM_PROMPT = """
            You are a nutrition expert. When given a food name (in any language), respond ONLY with a valid JSON object in this exact format with no extra text:
            {
              "foodName": "음식 이름 (한국어)",
              "calories": 숫자,
              "protein": 숫자,
              "carbs": 숫자,
              "fat": 숫자,
              "servingSize": "1인분 기준 (예: 100g)"
            }
            All nutrient values are in grams (g), calories in kcal. Base on a typical single serving.
            """;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public FoodController(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @PostMapping("/calories")
    public ResponseEntity<?> getCalories(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "query가 필요합니다."));
        }

        try {
            Map<String, Object> groqRequest = Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", query)
                    ),
                    "temperature", 0.1,
                    "max_tokens", 300
            );

            String groqResponse = restClient.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(groqRequest)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(groqResponse);
            String content = root.path("choices").get(0).path("message").path("content").asText().trim();

            int start = content.indexOf('{');
            int end = content.lastIndexOf('}') + 1;
            if (start == -1 || end == 0) {
                return ResponseEntity.internalServerError().body(Map.of("error", "AI 응답 파싱 실패"));
            }

            JsonNode foodData = objectMapper.readTree(content.substring(start, end));
            return ResponseEntity.ok(foodData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "칼로리 분석 실패: " + e.getMessage()));
        }
    }
}
