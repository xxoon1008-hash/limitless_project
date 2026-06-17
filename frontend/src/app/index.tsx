import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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
import { styles } from "../style/index_styles";
import { showAlert } from "../utils/alert";

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
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
          top: anim.interpolate({ inputRange: [0, 1], outputRange: [17, 6] }),
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
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );
}

const floatingStyles = StyleSheet.create({
  wrapper: { position: "relative", marginBottom: 16 },
  input: { marginBottom: 0, paddingTop: 24, paddingBottom: 8 },
});

const API_URL = "https://limitless-project.onrender.com";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      AsyncStorage.setItem("jwt_token", token).then(() => {
        window.history.replaceState({}, "", "/");
        router.replace("/main");
      });
    }
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      showAlert("알림", "모든 항목을 입력해 주세요.");
      return;
    }

    const isEmail = identifier.includes("@");
    const body = isEmail
      ? { email: identifier, password }
      : { nickname: identifier, password };

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("jwt_token", data.token);
        router.replace("/main");
      } else {
        showAlert("실패", data.message || "로그인 정보가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error(error);
      showAlert("알림", "존재하지 않는 계정입니다.");
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      const webRedirectUrl = window.location.origin;
      window.location.href = `${API_URL}/oauth2/authorization/google?prompt=select_account&web_redirect=${encodeURIComponent(webRedirectUrl)}`;
      return;
    }

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_URL}/oauth2/authorization/google?prompt=select_account`,
        "myapp://redirect",
      );

      if (result.type === "success") {
        const url = result.url;
        const token = new URL(url).searchParams.get("token");
        if (token) {
          await AsyncStorage.setItem("jwt_token", token);
          router.replace("/main");
        }
      }
    } catch (error) {
      console.error(error);
      showAlert("에러", "구글 로그인 중 오류가 발생했습니다.");
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
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <StatusBar barStyle="light-content" />

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Limitless</Text>
              <Text style={styles.subtitle}>
                오늘도 당신의 <Text style={styles.pointText}>한계</Text>를
                넘으세요.
              </Text>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.formContainer}>
                <FloatingLabelInput
                  label="이메일 또는 아이디"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
                <FloatingLabelInput
                  label="비밀번호"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>로그인</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: "https://img.icons8.com/color/48/000000/google-logo.png",
                    }}
                    style={styles.googleImage}
                  />
                  <Text style={styles.googleButtonText}>Google로 로그인</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => router.push("/signup")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signupButtonText}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
