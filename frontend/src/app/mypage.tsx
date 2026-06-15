import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

export default function MyPageScreen() {
  const [userName, setUserName] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirmInput, setPasswordConfirmInput] = useState("");
  const [idInput, setIdInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
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

  // 💡 데이터 저장 (친구분이 백엔드 API를 연결할 곳!)
  const handleSaveData = async () => {
    try {
      setIsLoading(true);

      // 1. 이름 변경 로직
      if (activeModal === "name") {
        const safeName = nameInput.trim();
        if (!safeName) return Alert.alert("알림", "이름을 입력해 주세요.");
        if (safeName.length > 10)
          return Alert.alert("알림", "10자 이내로 입력해 주세요.");
        setUserName(safeName);
        Alert.alert("완료", "이름이 성공적으로 변경되었습니다.");
      }
      // 2. 비밀번호 변경 로직
      else if (activeModal === "password") {
        if (!passwordInput || !passwordConfirmInput)
          return Alert.alert("알림", "비밀번호를 모두 입력해 주세요.");
        if (passwordInput !== passwordConfirmInput)
          return Alert.alert("알림", "비밀번호가 서로 일치하지 않습니다.");
        // TODO: 백엔드 비밀번호 변경 API 연동
        Alert.alert("완료", "비밀번호가 성공적으로 변경되었습니다.");
      }
      // 3. 아이디 변경 로직
      else if (activeModal === "id") {
        if (!idInput.trim())
          return Alert.alert("알림", "변경할 아이디를 입력해 주세요.");
        // TODO: 백엔드 아이디 중복 확인 및 변경 API 연동
        Alert.alert("완료", "아이디가 성공적으로 변경되었습니다.");
      }
      // 4. 키/몸무게 변경 로직
      else if (activeModal === "body") {
        if (!heightInput || !weightInput)
          return Alert.alert("알림", "키와 몸무게를 모두 입력해 주세요.");
        // TODO: 백엔드 신체 데이터 업데이트 API 연동
        Alert.alert("완료", "신체 정보가 성공적으로 업데이트되었습니다.");
      }

      // 저장 성공 시 팝업 닫기
      closeModal();
    } catch (error) {
      Alert.alert("오류", "전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 탈퇴 로직
  const handleDeleteAccount = () => {
    Alert.alert("알림", "정말로 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴하기",
        style: "destructive",
        onPress: () => {
          Alert.alert("탈퇴 완료", "이용해 주셔서 감사합니다.", [
            { text: "확인", onPress: () => router.replace("/") },
          ]);
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
            onPress={() => openModal("body")}
          >
            <Text style={styles.menuText}>신체정보 입력</Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openModal("password")}
          >
            <Text style={styles.menuText}>비밀번호 변경</Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openModal("id")}
          >
            <Text style={styles.menuText}>아이디 변경</Text>
            <Text style={styles.arrow}>＞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert("알림", "이메일: support@limitless.com")}
          >
            <Text style={styles.menuText}>고객 지원</Text>
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

      {/* 💡 통합 팝업창 (activeModal 상태에 따라 내용이 바뀜) */}
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

            {/* 아이디 변경 UI */}
            {activeModal === "id" && (
              <>
                <Text style={styles.modalTitle}>아이디 변경</Text>
                <TextInput
                  style={styles.modalInput}
                  value={idInput}
                  onChangeText={setIdInput}
                  placeholder="새로운 영문/숫자 아이디 입력"
                  placeholderTextColor="#888"
                  autoCapitalize="none"
                />
              </>
            )}

            {/* 키/몸무게 변경 UI */}
            {activeModal === "body" && (
              <>
                <Text style={styles.modalTitle}>신체 정보 수정</Text>
                <TextInput
                  style={styles.modalInput}
                  value={heightInput}
                  onChangeText={setHeightInput}
                  placeholder="키 입력 (cm)"
                  placeholderTextColor="#888"
                  keyboardType="numeric" // 숫자 키보드 띄우기
                />
                <TextInput
                  style={styles.modalInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="몸무게 입력 (kg)"
                  placeholderTextColor="#888"
                  keyboardType="numeric" // 숫자 키보드 띄우기
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
