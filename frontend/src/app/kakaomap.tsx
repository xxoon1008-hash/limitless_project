import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { styles } from "../style/kakaomap_styles";

const KAKAO_JS_KEY = "a4dc3525248e07a02ba1000b4ec12681";
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

const KAKAO_MAP_HTML = (withGeolocation: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; }
    #map { position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}"></script>
  <script type="text/javascript">
    var container = document.getElementById("map");
    var options = {
      center: new kakao.maps.LatLng(${DEFAULT_LAT}, ${DEFAULT_LNG}),
      level: 3,
    };
    var map = new kakao.maps.Map(container, options);

    ${withGeolocation ? `
    navigator.geolocation && navigator.geolocation.getCurrentPosition(function (pos) {
      var currentCenter = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.setCenter(currentCenter);
      new kakao.maps.Marker({ map: map, position: currentCenter, title: "현재 위치" });
    });
    ` : ""}
  </script>
</body>
</html>
`;

function KakaoMapWeb() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScript = (): Promise<void> =>
      new Promise((resolve) => {
        if ((window as any).kakao?.maps) { resolve(); return; }
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
        script.onload = () => (window as any).kakao.maps.load(resolve);
        document.head.appendChild(script);
      });

    loadScript().then(() => {
      if (!mapRef.current) return;
      const kakao = (window as any).kakao;
      const defaultCenter = new kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);
      const map = new kakao.maps.Map(mapRef.current, { center: defaultCenter, level: 3 });

      requestAnimationFrame(() => {
        navigator.geolocation?.getCurrentPosition((pos) => {
          const currentCenter = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(currentCenter);
          new kakao.maps.Marker({ map, position: currentCenter, title: "현재 위치" });
        });
      });
    });
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}

function NativeMap() {
  const { WebView } = require("react-native-webview");
  return (
    <WebView
      javaScriptEnabled
      originWhitelist={["*"]}
      style={{ flex: 1 }}
      source={{ html: KAKAO_MAP_HTML(false), baseUrl: "https://localhost" }}
    />
  );
}

export default function KakaoMap() {
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? <KakaoMapWeb /> : <NativeMap />}

      <View
        style={
          Platform.OS === "web"
            ? ({ position: "fixed", bottom: 0, left: 0, right: 0, flexDirection: "row", backgroundColor: "#1A1A1A", paddingVertical: 15, justifyContent: "space-around", borderTopWidth: 1, borderTopColor: "#333", zIndex: 100 } as any)
            : styles.bottomNav
        }
      >
        <TouchableOpacity onPress={() => router.replace("/main")}>
          <Ionicons name="home-outline" size={28} color="#A0A0A0" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="map" size={28} color="#FF5252" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/mypage")}>
          <Ionicons name="person-outline" size={28} color="#A0A0A0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
