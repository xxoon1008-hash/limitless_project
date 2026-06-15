import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function RedirectScreen() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      AsyncStorage.setItem("jwt_token", token).then(() => {
        router.replace("/main");
      });
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#FF5252" />
      <Text style={{ marginTop: 16, color: "#555" }}>로그인 중...</Text>
    </View>
  );
}
