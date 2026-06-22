import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import WorkoutCalendar from "../components/WorkoutCalendar";
import { FoodCalorieResult, analyzeFoodCalories } from "../services/groq";
import { styles } from "../style/main_styles";
import { showAlert } from "../utils/alert";

const API_URL = "https://limitless-project.onrender.com";

const getTodayDateString = () => {
  const now = new Date();
  const kstOffset = 9 * 60;
  const kstDate = new Date(
    now.getTime() + (kstOffset + now.getTimezoneOffset()) * 60000,
  );
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [message, setMessage] = useState("");
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(false);

  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
  const [foodSearchText, setFoodSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiResult, setAiResult] = useState<FoodCalorieResult | null>(null);

  const [calorieData, setCalorieData] = useState<{
    [key: string]: { intake: number; burned: number };
  }>({});

  useEffect(() => {
    const loadAttendances = async () => {
      const token = await AsyncStorage.getItem("jwt_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const dates: string[] = await res.json();
          setAttendanceDates(dates);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadAttendances();
  }, []);

  // 날짜 변경 시 해당 날짜의 섭취 칼로리 DB에서 로드
  const loadCalorieForDate = useCallback(async (date: string) => {
    const token = await AsyncStorage.getItem("jwt_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/food/record?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCalorieData((prev) => ({
          ...prev,
          [date]: {
            intake: data.totalCalories || 0,
            burned: prev[date]?.burned || 0,
          },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadCalorieForDate(selectedDate);
  }, [selectedDate, loadCalorieForDate]);

  const handleAttendance = async () => {
    if (isCheckingAttendance) return;
    const today = getTodayDateString();

    if (selectedDate !== today) {
      showAlert("출석 체크는 오늘 날짜만 가능합니다.");
      setSelectedDate(today);
      return;
    }

    if (attendanceDates.includes(today)) return;

    const token = await AsyncStorage.getItem("jwt_token");
    if (!token) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    setIsCheckingAttendance(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setAttendanceDates((prev) => [...prev, today]);
      } else {
        setMessage(data.message || "출석 체크에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setMessage("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingAttendance(false);
    }
  };

  const handleSearchFood = async () => {
    if (!foodSearchText.trim()) {
      showAlert("검색할 음식을 입력해 주세요.");
      return;
    }
    setIsSearching(true);
    setAiResult(null);
    try {
      const result = await analyzeFoodCalories(foodSearchText.trim());
      setAiResult(result);
    } catch (e: any) {
      showAlert(e.message || "칼로리 분석에 실패했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveFood = async () => {
    if (!aiResult) return;
    const token = await AsyncStorage.getItem("jwt_token");
    if (!token) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/food/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          foodName: aiResult.foodName,
          calories: aiResult.calories,
          protein: aiResult.protein,
          carbs: aiResult.carbs,
          fat: aiResult.fat,
          servingSize: aiResult.servingSize,
        }),
      });

      if (!res.ok) throw new Error("저장 실패");

      // DB 저장 후 해당 날짜 칼로리 다시 로드
      await loadCalorieForDate(selectedDate);
      setFoodSearchText("");
      setAiResult(null);
      setIsFoodModalVisible(false);
    } catch (e: any) {
      showAlert(e.message || "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Limitless</Text>
        </View>

        <View style={styles.calendarBox}>
          <WorkoutCalendar
            attendanceDates={attendanceDates}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            selectedDate={selectedDate}
          />
        </View>

        <View style={styles.attendanceSection}>
          <TouchableOpacity
            style={[
              styles.attendanceButton,
              attendanceDates.includes(getTodayDateString()) &&
                styles.completedButton,
            ]}
            onPress={handleAttendance}
            disabled={isCheckingAttendance}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.attendanceText}>
              {attendanceDates.includes(getTodayDateString())
                ? "출석 완료"
                : "운동 완료 출석 체크"}
            </Text>
          </TouchableOpacity>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        <View style={styles.calorieBox}>
          <Text style={styles.sectionTitle}>기록 데이터</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.infoCard}
              activeOpacity={0.8}
              onPress={() => setIsFoodModalVisible(true)}
            >
              <Ionicons name="fast-food-outline" size={30} color="#FF5252" />
              <Text style={styles.infoLabel}>섭취 칼로리</Text>
              <Text style={styles.infoValue}>
                {calorieData[selectedDate]?.intake || 0}{" "}
                <Text style={styles.unit}>kcal</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={30} color="#FF5252" />
              <Text style={styles.infoLabel}>소비 칼로리</Text>
              <Text style={styles.infoValue}>
                {calorieData[selectedDate]?.burned || 0}{" "}
                <Text style={styles.unit}>kcal</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home" size={28} color="#FF5252" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/kakaomap")}>
          <Ionicons name="map-outline" size={28} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/mypage")}>
          <Ionicons name="person-outline" size={28} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFoodModalVisible}
        onRequestClose={() => setIsFoodModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>식단 기록하기</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsFoodModalVisible(false);
                  setAiResult(null);
                  setFoodSearchText("");
                }}
              >
                <Ionicons name="close" size={28} color="#A0A0A0" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="음식 이름을 입력하세요 (예: 닭가슴살)"
                placeholderTextColor="#666"
                value={foodSearchText}
                onChangeText={setFoodSearchText}
                onSubmitEditing={handleSearchFood}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchFood}
              >
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.aiResultBox}>
              {isSearching ? (
                <>
                  <ActivityIndicator size="large" color="#FF5252" />
                  <Text style={[styles.aiResultText, { marginTop: 10 }]}>
                    AI가 분석 중입니다...
                  </Text>
                </>
              ) : aiResult ? (
                <>
                  <Text style={styles.aiResultFoodName} numberOfLines={1}>
                    {aiResult.foodName}
                  </Text>
                  <Text style={styles.aiResultServing}>{aiResult.servingSize}</Text>
                  <View style={styles.aiResultCalorieRow}>
                    <Text style={styles.aiResultCalorieValue}>
                      {Math.round(aiResult.calories)}
                    </Text>
                    <Text style={styles.aiResultCalorieUnit}> kcal</Text>
                  </View>
                  <View style={styles.aiNutrientRow}>
                    <View style={styles.aiNutrientItem}>
                      <Text style={styles.aiNutrientLabel}>탄수화물</Text>
                      <Text style={styles.aiNutrientValue}>
                        {Math.round(aiResult.carbs)}g
                      </Text>
                    </View>
                    <View style={styles.aiNutrientDivider} />
                    <View style={styles.aiNutrientItem}>
                      <Text style={styles.aiNutrientLabel}>단백질</Text>
                      <Text style={styles.aiNutrientValue}>
                        {Math.round(aiResult.protein)}g
                      </Text>
                    </View>
                    <View style={styles.aiNutrientDivider} />
                    <View style={styles.aiNutrientItem}>
                      <Text style={styles.aiNutrientLabel}>지방</Text>
                      <Text style={styles.aiNutrientValue}>
                        {Math.round(aiResult.fat)}g
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons
                    name="sparkles"
                    size={24}
                    color="#FF5252"
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={styles.aiResultText}>
                    음식 이름을 검색하면{"\n"}AI가 칼로리를 분석해 드립니다
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.saveFoodButton,
                (!aiResult || isSaving) && styles.saveFoodButtonDisabled,
              ]}
              onPress={handleSaveFood}
              disabled={!aiResult || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveFoodButtonText}>기록 저장하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
