import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://limitless-project.onrender.com";

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
  const token = await AsyncStorage.getItem("jwt_token");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await fetch(`${API_URL}/api/food/calories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: foodQuery }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "칼로리 분석에 실패했습니다.");
  }

  return response.json() as Promise<FoodCalorieResult>;
}
