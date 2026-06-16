import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
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

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var currentPos = new kakao.maps.LatLng(lat, lng);
            map.setCenter(currentPos);
            new kakao.maps.Marker({ map: map, position: currentPos, title: "현재 위치" });
          },
          function (error) {
            console.warn("위치 정보를 가져올 수 없습니다:", error.message);
          }
        );
      }
    });
  </script>
</body>
</html>
`;

function KakaoMapWeb() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        if (!mapRef.current) return;
        const map = new (window as any).kakao.maps.Map(mapRef.current, {
          center: new (window as any).kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const currentPos = new (window as any).kakao.maps.LatLng(
                lat,
                lng,
              );
              map.setCenter(currentPos);
              new (window as any).kakao.maps.Marker({
                map,
                position: currentPos,
                title: "현재 위치",
              });
            },
            (error) => {
              console.warn("위치 정보를 가져올 수 없습니다:", error.message);
            },
          );
        }
      });
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}

export default function KakaoMap() {
  const [steps, setSteps] = useState(5432);
  const [calories, setCalories] = useState(240);

  const renderMap = () => {
    if (Platform.OS === "web") {
      return <KakaoMapWeb />;
    }
    const { WebView } = require("react-native-webview");
    return (
      <WebView
        javaScriptEnabled
        geolocationEnabled
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        source={{ baseUrl: "https://localhost:8081", html: mapHtml }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}

      {/* 뒤로 가기 버튼 */}
      <View style={styles.topLeft}>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => router.push("/main")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
