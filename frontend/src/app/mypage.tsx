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
import { styles } from "../style/mypage_styles";
import { showAlert } from "../utils/alert";

const API_URL = "https://limitless-project.onrender.com";

export default function MyPageScreen() {
  const [userName, setUserName] = useState("");
  const [userProvider, setUserProvider] = useState("");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirmInput, setPasswordConfirmInput] = useState("");
  const [deletePasswordInput, setDeletePasswordInput] = useState("");

  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        if (!token) return;
        const [userRes, attendRes] = await Promise.all([
          fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (userRes.ok) {
          const data = await userRes.json();
          setUserProvider(data.provider || "local");
          setUserName(data.provider === "google" ? data.email : (data.nickname || data.email || ""));
        }
        if (attendRes.ok) {
          const dates: string[] = await attendRes.json();
          setAttendanceCount(dates.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  const openModal = (type: string) => {
    if (type === "name") setNameInput(userName);
    if (type === "password") { setPasswordInput(""); setPasswordConfirmInput(""); }
    if (type === "deleteAccount") setDeletePasswordInput("");
    setActiveModal(type);
  };

  const closeModal = () => setActiveModal(null);

  const handleSaveData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("jwt_token");

      if (activeModal === "name") {
        const safeName = nameInput.trim();
        if (!safeName) return showAlert("아이디를 입력해 주세요.");
        if (safeName.length > 10) return showAlert("10자 이내로 입력해 주세요.");
        const res = await fetch(`${API_URL}/api/users/nickname`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nickname: safeName }),
        });
        if (!res.ok) {
          const data = await res.json();
          return showAlert(data.message || "아이디 변경에 실패했습니다.");
        }
        setUserName(safeName);
        showAlert("아이디가 변경되었습니다.");
      } else if (activeModal === "password") {
        if (!passwordInput || !passwordConfirmInput) return showAlert("비밀번호를 모두 입력해 주세요.");
        const PASSWORD_REGEX = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!PASSWORD_REGEX.test(passwordInput)) return showAlert("비밀번호는 8자 이상이며 특수문자를 포함해야 합니다.");
        if (passwordInput !== passwordConfirmInput) return showAlert("비밀번호가 서로 일치하지 않습니다.");
        const res = await fetch(`${API_URL}/api/users/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ password: passwordInput }),
        });
        if (!res.ok) {
          const data = await res.json();
          return showAlert(data.message || "비밀번호 변경에 실패했습니다.");
        }
        showAlert("비밀번호가 변경되었습니다.");
      } else if (activeModal === "deleteAccount") {
        if (userProvider === "local" && !deletePasswordInput) return showAlert("비밀번호를 입력해 주세요.");
        const res = await fetch(`${API_URL}/api/users/me`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ password: deletePasswordInput }),
        });
        if (!res.ok) {
          const data = await res.json();
          return showAlert(data.message || "탈퇴 처리 중 오류가 발생했습니다.");
        }
        await AsyncStorage.removeItem("jwt_token");
        closeModal();
        showAlert("이용해 주셔서 감사합니다.", [{ text: "확인", onPress: () => router.replace("/") }]);
        return;
      }
      closeModal();
    } catch {
      showAlert("전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwt_token");
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0F1E" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── 프로필 헤더 ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🏃</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>{userName || "사용자"}</Text>
          <Text style={styles.userSubText}>
            {userProvider === "google" ? "Google 계정" : "일반 계정"}
          </Text>
          <TouchableOpacity style={styles.changeNameButton} onPress={() => openModal("name")}>
            <Text style={styles.changeNameButtonText}>닉네임 변경</Text>
          </TouchableOpacity>
        </View>

        {/* ── 통계 카드 ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(0,200,150,0.15)" }]}>
              <Ionicons name="calendar-outline" size={18} color="#00C896" />
            </View>
            <Text style={styles.statValue}>{attendanceCount}</Text>
            <Text style={styles.statLabel}>출석일</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(96,165,250,0.15)" }]}>
              <Ionicons name="flame-outline" size={18} color="#60A5FA" />
            </View>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>이번 주</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(249,115,22,0.15)" }]}>
              <Ionicons name="trophy-outline" size={18} color="#F97316" />
            </View>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>최장 연속</Text>
          </View>
        </View>

        {/* ── 계정 메뉴 ── */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>계정</Text>
          <View style={styles.menuCard}>
            {userProvider !== "google" && (
              <TouchableOpacity style={styles.menuItem} onPress={() => openModal("password")}>
                <View style={[styles.menuIconWrap, { backgroundColor: "rgba(96,165,250,0.15)" }]}>
                  <Ionicons name="lock-closed-outline" size={17} color="#60A5FA" />
                </View>
                <Text style={styles.menuText}>비밀번호 변경</Text>
                <Ionicons name="chevron-forward" size={16} color="#4A5568" style={styles.menuArrow} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => showAlert("이메일: support@limitless.com")}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "rgba(0,200,150,0.15)" }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={17} color="#00C896" />
              </View>
              <Text style={styles.menuText}>고객 지원</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A5568" style={styles.menuArrow} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 위험 영역 ── */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>기타</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIconWrap, { backgroundColor: "rgba(248,113,113,0.15)" }]}>
                <Ionicons name="log-out-outline" size={17} color="#F87171" />
              </View>
              <Text style={styles.menuTextRed}>로그아웃</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A5568" style={styles.menuArrow} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => openModal("deleteAccount")}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "rgba(248,113,113,0.1)" }]}>
                <Ionicons name="trash-outline" size={17} color="#F87171" />
              </View>
              <Text style={styles.menuTextRed}>회원 탈퇴</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A5568" style={styles.menuArrow} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* ── 하단 탭 ── */}
      <View
        style={
          Platform.OS === "web"
            ? ({ position: "fixed", bottom: 0, left: 0, right: 0, flexDirection: "row", backgroundColor: "#131B2E", paddingVertical: 15, justifyContent: "space-around", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", zIndex: 100 } as any)
            : styles.bottomNav
        }
      >
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/main")}>
          <Ionicons name="home-outline" size={24} color="#4A5568" />
          <Text style={styles.navLabel}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/kakaomap")}>
          <Ionicons name="map-outline" size={24} color="#4A5568" />
          <Text style={styles.navLabel}>지도</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navActiveIndicator} />
          <Ionicons name="person" size={24} color="#00C896" />
          <Text style={styles.navLabelActive}>마이</Text>
        </TouchableOpacity>
      </View>

      {/* ── 모달 ── */}
      <Modal animationType="fade" transparent visible={activeModal !== null} onRequestClose={closeModal}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalContent}>
            {activeModal === "name" && (
              <>
                <Text style={styles.modalTitle}>닉네임 변경</Text>
                <TextInput
                  style={styles.modalInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="새로운 닉네임 (10자 이내)"
                  placeholderTextColor="#4A5568"
                  maxLength={10}
                />
              </>
            )}
            {activeModal === "password" && (
              <>
                <Text style={styles.modalTitle}>비밀번호 변경</Text>
                <TextInput
                  style={styles.modalInput}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  placeholder="새로운 비밀번호"
                  placeholderTextColor="#4A5568"
                  secureTextEntry
                />
                <TextInput
                  style={styles.modalInput}
                  value={passwordConfirmInput}
                  onChangeText={setPasswordConfirmInput}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#4A5568"
                  secureTextEntry
                />
              </>
            )}
            {activeModal === "deleteAccount" && (
              <>
                <Text style={styles.modalTitle}>회원 탈퇴</Text>
                {userProvider === "local" ? (
                  <TextInput
                    style={styles.modalInput}
                    value={deletePasswordInput}
                    onChangeText={setDeletePasswordInput}
                    placeholder="현재 비밀번호 입력"
                    placeholderTextColor="#4A5568"
                    secureTextEntry
                  />
                ) : (
                  <Text style={styles.deleteWarningText}>정말로 탈퇴하시겠습니까?{"\n"}이 작업은 되돌릴 수 없습니다.</Text>
                )}
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeModal}>
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={activeModal === "deleteAccount" ? styles.modalDeleteButton : styles.modalSaveButton}
                onPress={handleSaveData}
              >
                <Text style={styles.modalSaveButtonText}>
                  {activeModal === "deleteAccount" ? "탈퇴하기" : "변경 완료"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
