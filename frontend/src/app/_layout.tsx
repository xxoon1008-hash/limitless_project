import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 여기에 등록된 화면들끼리만 이동이 가능해집니다 */}
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
