import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
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

const formatDisplayDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${month}월 ${day}일 (${weekdays[date.getDay()]})`;
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
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }
      } catch {
        // 위치 권한 없어도 저장 진행
      }

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
          latitude,
          longitude,
        }),
      });
      if (!res.ok) throw new Error("저장 실패");
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

  const isAttendedToday = attendanceDates.includes(getTodayDateString());
  const intake = calorieData[selectedDate]?.intake || 0;
  const burned = calorieData[selectedDate]?.burned || 0;
  const goalCalories = 2000;
  const intakePercent = Math.min((intake / goalCalories) * 100, 100);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Limitless</Text>
          </View>
        </View>

        {/* ── 날짜 + 출석 뱃지 ── */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
          {isAttendedToday && (
            <View style={styles.attendedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#00C896" />
              <Text style={styles.attendedBadgeText}>출석 완료</Text>
            </View>
          )}
        </View>

        {/* ── 칼로리 요약 카드 ── */}
        <TouchableOpacity
          style={styles.calorieCard}
          onPress={() => setIsFoodModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.calorieCardTop}>
            <View>
              <Text style={styles.calorieCardLabel}>오늘 섭취 칼로리</Text>
              <View style={styles.calorieValueRow}>
                <Text style={styles.calorieValueBig}>{Math.round(intake)}</Text>
                <Text style={styles.calorieUnit}> / {goalCalories} kcal</Text>
              </View>
            </View>
          </View>

          {/* 진행 바 */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${intakePercent}%` as any },
              ]}
            />
          </View>

          {/* 영양소 요약 */}
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: "#F97316" }]} />
              <Text style={styles.macroLabel}>소비</Text>
              <Text style={styles.macroValue}>{Math.round(burned)} kcal</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: "#00C896" }]} />
              <Text style={styles.macroLabel}>목표</Text>
              <Text style={styles.macroValue}>{goalCalories} kcal</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: "#60A5FA" }]} />
              <Text style={styles.macroLabel}>잔여</Text>
              <Text style={styles.macroValue}>
                {Math.max(goalCalories - intake, 0)} kcal
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── 달력 ── */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>출석 캘린더</Text>
          <Text style={styles.sectionSub}>
            이번 달 {attendanceDates.length}일 출석
          </Text>
          <View style={styles.calendarBox}>
            <WorkoutCalendar
              attendanceDates={attendanceDates}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              selectedDate={selectedDate}
            />
          </View>
        </View>

        {/* ── 출석 버튼 ── */}
        <TouchableOpacity
          style={[
            styles.attendanceButton,
            isAttendedToday && styles.attendanceButtonDone,
          ]}
          onPress={handleAttendance}
          disabled={isCheckingAttendance || isAttendedToday}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isAttendedToday ? "checkmark-circle" : "barbell-outline"}
            size={22}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <View>
            <Text style={styles.attendanceButtonTitle}>
              {isAttendedToday ? "오늘 운동 완료!" : "운동 완료 출석 체크"}
            </Text>
            <Text style={styles.attendanceButtonSub}>
              {isAttendedToday
                ? `이번 달 ${attendanceDates.length}일 출석`
                : "운동을 마쳤다면 체크하세요"}
            </Text>
          </View>
          {!isAttendedToday && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.5)"
              style={{ marginLeft: "auto" }}
            />
          )}
        </TouchableOpacity>
        {message ? <Text style={styles.errorText}>{message}</Text> : null}
      </ScrollView>

      {/* ── 하단 탭 ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navActiveIndicator} />
          <Ionicons name="home" size={24} color="#00C896" />
          <Text style={styles.navLabelActive}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/kakaomap")}
        >
          <Ionicons name="map-outline" size={24} color="#4A5568" />
          <Text style={styles.navLabel}>지도</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/mypage")}
        >
          <Ionicons name="person-outline" size={24} color="#4A5568" />
          <Text style={styles.navLabel}>마이</Text>
        </TouchableOpacity>
      </View>

      {/* ── 식단 기록 모달 ── */}
      <Modal
        animationType="slide"
        transparent
        visible={isFoodModalVisible}
        onRequestClose={() => setIsFoodModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            {/* 핸들 바 */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>식단 기록</Text>
                <Text style={styles.modalSub}>
                  AI가 칼로리를 자동 분석합니다.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsFoodModalVisible(false);
                  setAiResult(null);
                  setFoodSearchText("");
                }}
              >
                <Ionicons name="close-circle" size={28} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="음식 이름을 입력하세요."
                placeholderTextColor="#4A5568"
                value={foodSearchText}
                onChangeText={setFoodSearchText}
                onSubmitEditing={handleSearchFood}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchFood}
              >
                <Ionicons name="search" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.aiResultBox}>
              {isSearching ? (
                <>
                  <ActivityIndicator size="large" color="#00C896" />
                  <Text style={[styles.aiHintText, { marginTop: 12 }]}>
                    AI가 분석 중입니다...
                  </Text>
                </>
              ) : aiResult ? (
                <>
                  <View style={styles.calorieHighlight}>
                    <Text style={styles.calorieHighlightNum}>
                      {Math.round(aiResult.calories)}
                    </Text>
                    <Text style={styles.calorieHighlightUnit}>kcal</Text>
                  </View>
                  <View style={styles.aiNutrientRow}>
                    {[
                      {
                        label: "탄수화물",
                        value: Math.round(aiResult.carbs),
                        color: "#60A5FA",
                      },
                      {
                        label: "단백질",
                        value: Math.round(aiResult.protein),
                        color: "#00C896",
                      },
                      {
                        label: "지방",
                        value: Math.round(aiResult.fat),
                        color: "#F97316",
                      },
                    ].map((n, i) => (
                      <View key={i} style={styles.aiNutrientItem}>
                        <View
                          style={[
                            styles.nutrientBar,
                            { backgroundColor: n.color + "33" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.nutrientBarValue,
                              { color: n.color },
                            ]}
                          >
                            {n.value}g
                          </Text>
                        </View>
                        <Text style={styles.aiNutrientLabel}>{n.label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.aiHintIcon}>
                    <Ionicons name="sparkles" size={28} color="#00C896" />
                  </View>
                  <Text style={styles.aiHintText}>
                    음식 이름을 검색하면{"\n"}AI가 칼로리를 분석해 드립니다.
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
                <>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.saveFoodButtonText}>기록 저장하기</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
