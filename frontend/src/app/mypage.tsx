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

export default function MyPageScreen() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirmInput, setPasswordConfirmInput] = useState("");
  const [idInput, setIdInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        if (!token) return;
        const res = await fetch(
          "https://limitless-project.onrender.com/api/users/me",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          // 구글 로그인이면 이메일, 일반 로그인이면 아이디 → 없으면 이메일 표시
          if (data.provider === "google") {
            setUserName(data.email);
          } else {
            setUserName(data.nickname || data.email || "");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  // 팝업 열기 함수
  const openModal = (type: string) => {
    // 팝업 열 때 기존 입력값 초기화 및 세팅
    if (type === "name") setNameInput(userName);
    if (type === "password") {
      setPasswordInput("");
      setPasswordConfirmInput("");
    }
    if (type === "id") setIdInput("");
    if (type === "body") {
      setHeightInput("");
      setWeightInput("");
    }
    setActiveModal(type);
  };

  // 팝업 닫기 함수
  const closeModal = () => {
    setActiveModal(null);
  };

  const API_URL = "https://limitless-project.onrender.com";

  const handleSaveData = async () => {
    try {
      setIsLoading(true);

      if (activeModal === "name") {
        const safeName = nameInput.trim();
        if (!safeName) return showAlert("이름을 입력해 주세요.");
        if (safeName.length > 10) return showAlert("10자 이내로 입력해 주세요.");
        setUserName(safeName);
        showAlert("이름이 성공적으로 변경되었습니다.");
      } else if (activeModal === "password") {
        if (!passwordInput || !passwordConfirmInput)
          return showAlert("비밀번호를 모두 입력해 주세요.");
        if (passwordInput !== passwordConfirmInput)
          return showAlert("비밀번호가 서로 일치하지 않습니다.");

        const token = await AsyncStorage.getItem("jwt_token");
        const res = await fetch(`${API_URL}/api/users/password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: passwordInput }),
        });
        if (!res.ok) {
          const data = await res.json();
          return showAlert(data.message || "비밀번호 변경에 실패했습니다.");
        }
        showAlert("비밀번호가 성공적으로 변경되었습니다.");
      }

      closeModal();
    } catch (error) {
      showAlert("전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwt_token");
    router.replace("/");
  };

  const handleDeleteAccount = () => {
    showAlert("정말로 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴하기",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("jwt_token");
            const res = await fetch(`${API_URL}/api/users/me`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              const data = await res.json();
              return showAlert(data.message || "탈퇴 처리 중 오류가 발생했습니다.");
            }
            await AsyncStorage.removeItem("jwt_token");
            showAlert("이용해 주셔서 감사합니다.", [
              { text: "확인", onPress: () => router.replace("/") },
            ]);
          } catch {
            showAlert("서버와 통신 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 상단 헤더 */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => router.push("/main")}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 1. 상단 프로필 영역 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              <Text style={styles.userName}>{userName}</Text>
            </Text>
            <TouchableOpacity
              style={styles.changeNameButton}
              onPress={() => openModal("name")}
              disabled={isLoading}
            >
              <Text style={styles.changeNameButtonText}>이름 변경하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 2. 하단 메뉴 영역 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openModal("password")}
          >
            <Text style={styles.menuText}>비밀번호 변경</Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showAlert("이메일: support@limitless.com")}
          >
            <Text style={styles.menuText}>고객 지원</Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, { color: "#e74c3c" }]}>로그아웃</Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.menuText, { color: "#e74c3c" }]}>
              회원 탈퇴
            </Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.securityFooter}></Text>
      </ScrollView>

      {/* 통합 팝업창 (activeModal 상태에 따라 내용이 바뀜) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={activeModal !== null} // activeModal이 null이 아니면 무조건 열림
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            {/* 이름 변경 UI */}
            {activeModal === "name" && (
              <>
                <Text style={styles.modalTitle}>이름 변경하기</Text>
                <TextInput
                  style={styles.modalInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="새로운 이름 입력 (10자 이내)"
                  placeholderTextColor="#888"
                  maxLength={10}
                />
              </>
            )}

            {/* 비밀번호 변경 UI */}
            {activeModal === "password" && (
              <>
                <Text style={styles.modalTitle}>비밀번호 변경</Text>
                <TextInput
                  style={styles.modalInput}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  placeholder="새로운 비밀번호 입력"
                  placeholderTextColor="#888"
                  secureTextEntry // 비밀번호 가리기
                />
                <TextInput
                  style={styles.modalInput}
                  value={passwordConfirmInput}
                  onChangeText={setPasswordConfirmInput}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#888"
                  secureTextEntry // 비밀번호 가리기
                />
              </>
            )}

            {/* 팝업 공통 버튼 (취소/저장) */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeModal}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveData}
              >
                <Text style={styles.modalSaveButtonText}>변경 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
