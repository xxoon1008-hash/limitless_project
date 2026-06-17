import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { styles } from "../style/kakaomap_styles";

const KAKAO_JS_KEY = "a4dc3525248e07a02ba1000b4ec12681";
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

// 웹: Kakao Maps DOM 방식
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

      navigator.geolocation?.getCurrentPosition((pos) => {
        const currentCenter = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(currentCenter);
        new kakao.maps.Marker({ map, position: currentCenter, title: "현재 위치" });
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

// 앱: react-native-maps 네이티브
function NativeMap() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const MapView = require("react-native-maps").default;
  const { Marker } = require("react-native-maps");

  useEffect(() => {
    (async () => {
      try {
        const Location = await import("expo-location");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      region={
        location
          ? { ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }
          : undefined
      }
      showsUserLocation
      showsMyLocationButton
    >
      {location && (
        <Marker coordinate={location} title="현재 위치" />
      )}
    </MapView>
  );
}

export default function KakaoMap() {
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? <KakaoMapWeb /> : <NativeMap />}

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
