import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../style/signup_styles";
import { showAlert } from "../utils/alert";

const API_URL = "https://limitless-project.onrender.com";

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={floatingStyles.wrapper}>
      <Animated.Text
        style={{
          position: "absolute",
          left: 16,
          zIndex: 1,
          top: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 5] }),
          fontSize: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
          }),
          color: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["#cccccc", "#ffffff"],
          }),
        }}
      >
        {label}
      </Animated.Text>
      <TextInput
        style={[
          styles.input,
          floatingStyles.input,
          isFocused && styles.inputFocused,
          secureTextEntry && { paddingRight: 48 },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry && !isVisible}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={floatingStyles.eyeButton}
          onPress={() => setIsVisible((v) => !v)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isVisible ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const floatingStyles = StyleSheet.create({
  wrapper: { position: "relative", marginBottom: 20 },
  input: { paddingTop: 24, paddingBottom: 8 },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const handleSignup = async () => {
    if (!email || !name || !nickname || !password || !passwordCheck) {
      showAlert("모든 항목을 입력해 주세요.");
      return;
    }

    if (password !== passwordCheck) {
      showAlert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ email, name, nickname, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("회원가입이 완료되었습니다!", [
          { text: "확인", onPress: () => router.replace("/") },
        ]);
      } else {
        showAlert(data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      showAlert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/1200x/e6/f4/40/e6f440928a7c4050a42f076d4fb7b4d4.jpg",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <StatusBar barStyle="light-content" />
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.headerTitle}>회원가입</Text>
            <Text style={styles.headerSubtitle}>
              건강한 변화의 시작, 정보를 입력해 주세요.
            </Text>

            <FloatingLabelInput
              label="이름"
              value={name}
              onChangeText={setName}
            />

            <FloatingLabelInput
              label="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <FloatingLabelInput
              label="아이디"
              value={nickname}
              onChangeText={setNickname}
            />

            <FloatingLabelInput
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <FloatingLabelInput
              label="비밀번호 재입력"
              value={passwordCheck}
              onChangeText={setPasswordCheck}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignup}
            >
              <Text style={styles.submitButtonText}>회원가입</Text>
            </TouchableOpacity>

<TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
