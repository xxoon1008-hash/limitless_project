import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { styles } from "../style/kakaomap_styles";

const KAKAO_JS_KEY = "a4dc3525248e07a02ba1000b4ec12681";
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

const buildMapHtml = () => `
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
      new kakao.maps.Map(document.getElementById("map"), {
        center: new kakao.maps.LatLng(${DEFAULT_LAT}, ${DEFAULT_LNG}),
        level: 3,
      });
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
        new (window as any).kakao.maps.Map(mapRef.current, {
          center: new (window as any).kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG),
          level: 3,
        });
      });
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}

export default function KakaoMap() {
  const renderMap = () => {
    if (Platform.OS === "web") {
      return <KakaoMapWeb />;
    }

    const { WebView } = require("react-native-webview");
    return (
      <WebView
        javaScriptEnabled
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        source={{ html: buildMapHtml() }}
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
