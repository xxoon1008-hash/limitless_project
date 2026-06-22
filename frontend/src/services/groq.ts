const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface FoodCalorieResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

export async function analyzeFoodCalories(
  foodQuery: string,
): Promise<FoodCalorieResult> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ API 키가 설정되지 않았습니다.");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert. When given a food name (in any language), respond ONLY with a valid JSON object in this exact format with no extra text:
{
  "foodName": "음식 이름 (한국어)",
  "calories": 숫자,
  "protein": 숫자,
  "carbs": 숫자,
  "fat": 숫자,
  "servingSize": "1인분 기준 (예: 100g)"
}
All nutrient values are in grams (g), calories in kcal. Base on a typical single serving.`,
        },
        {
          role: "user",
          content: foodQuery,
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API 오류: ${err}`);
  }

  const data = await response.json();
  const content: string = data.choices[0].message.content.trim();

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 응답 파싱에 실패했습니다.");

  return JSON.parse(jsonMatch[0]) as FoodCalorieResult;
}
