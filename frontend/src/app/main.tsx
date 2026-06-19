import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { styles } from "../style/main_styles";
import { showAlert } from "../utils/alert";

const API_URL = "https://limitless-project.onrender.com";
const GEMINI_API_KEY = "AQ.Ab8RN6IeQ-o1zl4tiJPV1fhvPhY3-976e0SL07uC6JGE9g1fCg";

const getTodayDateString = () => {
  const now = new Date();
  // 한국 시간(KST, UTC+9) 기준으로 날짜 계산
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

  // 음식 검색 팝업 상태 관리
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
  const [foodSearchText, setFoodSearchText] = useState("");
  const [aiCalorie, setAiCalorie] = useState<number | null>(null);
  const [aiResultText, setAiResultText] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [calorieData, setCalorieData] = useState<{
    [key: string]: { intake: number; burned: number };
  }>({});

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

  // 음식 검색 버튼 눌렀을 때 실행될 함수
  const handleSearchFood = async () => {
    const query = foodSearchText.trim();
    if (!query) {
      showAlert("검색할 음식을 입력해 주세요.");
      return;
    }

    setIsAiLoading(true);
    setAiCalorie(null);
    setAiResultText("");

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `"${query}" 1인분의 평균 칼로리(kcal)와 주요 영양소(단백질, 탄수화물, 지방)를 한국어로 간단하게 알려줘. 첫 줄에는 칼로리 숫자만 써줘(예: 350). 둘째 줄부터 영양소 정보를 써줘.`,
                  },
                ],
              },
            ],
          }),
        },
      );
      const data = await res.json();
      const text: string =
        data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const lines = text.trim().split("\n");
      const kcal = parseInt(lines[0]?.match(/\d+/)?.[0] ?? "0", 10);
      const detail = lines.slice(1).join("\n").trim();
      setAiCalorie(kcal);
      setAiResultText(detail);
    } catch {
      showAlert("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.headerTitle}>Limitless</Text>
          </TouchableOpacity>
        </View>

        {/* 1. 달력 영역 */}
        <View style={styles.calendarBox}>
          <WorkoutCalendar
            attendanceDates={attendanceDates}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            selectedDate={selectedDate}
          />
        </View>

        {/* 2. 출석 버튼 */}
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

        {/* 3. 칼로리 정보 칸 */}
        <View style={styles.calorieBox}>
          <Text style={styles.sectionTitle}>기록 데이터</Text>
          <View style={styles.row}>
            {/* 섭취 칼로리 버튼 */}
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

            {/* 소비 칼로리 칸 */}
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

      {/* 하단 메뉴 */}
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

      {/* 음식 검색 팝업창 (Modal) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFoodModalVisible}
        onRequestClose={() => {
          setIsFoodModalVisible(false);
          setFoodSearchText("");
          setAiCalorie(null);
          setAiResultText("");
        }}
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
                  setFoodSearchText("");
                  setAiCalorie(null);
                  setAiResultText("");
                }}
              >
                <Ionicons name="close" size={28} color="#A0A0A0" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="어떤 음식을 드셨나요? (예: 닭가슴살)"
                placeholderTextColor="#888"
                value={foodSearchText}
                onChangeText={setFoodSearchText}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchFood}
              >
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.aiResultBox}>
              <Ionicons
                name="sparkles"
                size={24}
                color="#FF5252"
                style={{ marginBottom: 10 }}
              />
              {isAiLoading ? (
                <Text style={styles.aiResultText}>AI 분석 중...</Text>
              ) : aiCalorie !== null ? (
                <>
                  <Text
                    style={[
                      styles.aiResultText,
                      { fontSize: 20, fontWeight: "bold", color: "#FF5252" },
                    ]}
                  >
                    {foodSearchText} 약 {aiCalorie} kcal
                  </Text>
                  {aiResultText ? (
                    <Text
                      style={[
                        styles.aiResultText,
                        { marginTop: 8, fontSize: 13 },
                      ]}
                    >
                      {aiResultText}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.aiResultText}>
                  음식을 검색하시면 AI가 평균 칼로리를{"\n"}자동으로 분석해
                  드립니다!
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.saveFoodButton}
              onPress={() => {
                setIsFoodModalVisible(false);
                setFoodSearchText("");
                setAiCalorie(null);
                setAiResultText("");
              }}
            >
              <Text style={styles.saveFoodButtonText}>기록 저장하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
