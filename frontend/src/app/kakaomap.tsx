import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { styles } from "../style/kakaomap_styles";

const KAKAO_JS_KEY = "a4dc3525248e07a02ba1000b4ec12681";

const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false"></script>
  <script>
    kakao.maps.load(function () {
      var map = new kakao.maps.Map(document.getElementById("map"), {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      });
    });
  </script>
</body>
</html>
`;

export default function KakaoMap() {
  const [steps, setSteps] = useState(5432);
  const [calories, setCalories] = useState(240);

  return (
    <View style={styles.container}>
      {/* 1. 배경에 꽉 차게 깔리는 지도 */}
      <WebView
        javaScriptEnabled
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        source={{ baseUrl: "https://localhost:8081", html: mapHtml }}
      />

      {/* 💡 2. 새로 추가된 왼쪽 위 뒤로 가기 버튼 */}
      <View style={styles.topLeft}>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => router.push("/main")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* 3. 지도 위에 둥둥 떠 있는 왼쪽 아래 만보기 */}
      <View style={styles.bottomLeft}>
        <Text style={styles.outlineText}>👣 {steps} 걸음</Text>
      </View>

      {/* 4. 지도 위에 둥둥 떠 있는 오른쪽 아래 칼로리 */}
      <View style={styles.bottomRight}>
        <Text style={styles.outlineText}>🔥 {calories} kcal</Text>
      </View>
    </View>
  );
}
