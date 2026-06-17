import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../style/kakaomap_styles";

const KAKAO_JS_KEY = "a4dc3525248e07a02ba1000b4ec12681";

const buildMapHtml = (lat: number, lng: number) => `
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
      var currentPos = new kakao.maps.LatLng(${lat}, ${lng});
      var map = new kakao.maps.Map(document.getElementById("map"), {
        center: currentPos,
        level: 3,
      });
      new kakao.maps.Marker({ map: map, position: currentPos, title: "현재 위치" });
    });
  </script>
</body>
</html>
`;

function KakaoMapWeb() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
        script.onload = () => {
          (window as any).kakao.maps.load(() => {
            if (!mapRef.current) return;
            const currentPos = new (window as any).kakao.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude,
            );
            const map = new (window as any).kakao.maps.Map(mapRef.current, {
              center: currentPos,
              level: 3,
            });
            new (window as any).kakao.maps.Marker({
              map,
              position: currentPos,
              title: "현재 위치",
            });
          });
        };
        document.head.appendChild(script);
      },
      () => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
        script.onload = () => {
          (window as any).kakao.maps.load(() => {
            if (!mapRef.current) return;
            new (window as any).kakao.maps.Map(mapRef.current, {
              center: new (window as any).kakao.maps.LatLng(37.5665, 126.978),
              level: 3,
            });
          });
        };
        document.head.appendChild(script);
      },
    );
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}

export default function KakaoMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (Platform.OS === "web") return;

    (async () => {
      try {
        const Location = await import("expo-location");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("위치 권한이 거부되었습니다.");
          setLocation({ lat: 37.5665, lng: 126.978 });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        setLocationError("위치를 가져올 수 없습니다.");
        setLocation({ lat: 37.5665, lng: 126.978 });
      }
    })();
  }, []);

  const renderMap = () => {
    if (Platform.OS === "web") {
      return <KakaoMapWeb />;
    }

    if (!location) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#fff" }}>위치 정보를 가져오는 중...</Text>
        </View>
      );
    }

    const { WebView } = require("react-native-webview");
    return (
      <WebView
        javaScriptEnabled
        geolocationEnabled
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        source={{ html: buildMapHtml(location.lat, location.lng) }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}

      <View
        style={
          Platform.OS === "web"
            ? ({ position: "fixed", top: 60, left: 20, zIndex: 100 } as any)
            : styles.topLeft
        }
      >
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
