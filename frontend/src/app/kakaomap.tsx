import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { styles } from "../style/kakaomap_styles";

const KAKAO_JS_KEY = "a4dc3525248e07a02ba1000b4ec12681";
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;
const API_URL = "https://limitless-project.onrender.com";

type FoodLocation = {
  id: number;
  foodName: string;
  calories: number;
  recordedAt: string;
  latitude: number;
  longitude: number;
};

const KAKAO_MAP_HTML = (foodLocations: FoodLocation[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; }
    #map { position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
    .info-window {
      padding: 8px 12px;
      background: #1A1A1A;
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      line-height: 1.6;
      min-width: 120px;
    }
    .info-name { font-weight: bold; color: #00C896; }
    .info-cal { color: #aaa; font-size: 11px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=clusterer"></script>
  <script type="text/javascript">
    var container = document.getElementById("map");
    var options = {
      center: new kakao.maps.LatLng(${DEFAULT_LAT}, ${DEFAULT_LNG}),
      level: 3,
    };
    var map = new kakao.maps.Map(container, options);

    navigator.geolocation && navigator.geolocation.getCurrentPosition(function (pos) {
      var currentCenter = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.setCenter(currentCenter);
      new kakao.maps.Marker({ map: map, position: currentCenter, title: "현재 위치" });
    });

    var foodLocations = ${JSON.stringify(foodLocations)};
    var openInfoWindow = null;

    var markerImage = new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new kakao.maps.Size(24, 35)
    );

    var markers = foodLocations.map(function(item) {
      var pos = new kakao.maps.LatLng(item.latitude, item.longitude);
      var marker = new kakao.maps.Marker({ position: pos, image: markerImage, title: item.foodName });

      var content =
        '<div class="info-window">' +
        '<div class="info-name">' + item.foodName + '</div>' +
        '<div class="info-cal">' + Math.round(item.calories) + ' kcal · ' + item.recordedAt + '</div>' +
        '</div>';
      var infoWindow = new kakao.maps.InfoWindow({ content: content, removable: true });

      kakao.maps.event.addListener(marker, 'click', function() {
        if (openInfoWindow) openInfoWindow.close();
        infoWindow.open(map, marker);
        openInfoWindow = infoWindow;
      });

      return marker;
    });

    new kakao.maps.MarkerClusterer({
      map: map,
      markers: markers,
      gridSize: 60,
      averageCenter: true,
      minLevel: 4,
      disableClickZoom: false,
      styles: [{
        width: '48px',
        height: '48px',
        background: '#00C896',
        borderRadius: '50%',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '15px',
        lineHeight: '48px',
        textAlign: 'center',
        border: '2px solid #fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }],
    });
  </script>
</body>
</html>
`;

function KakaoMapWeb({ foodLocations }: { foodLocations: FoodLocation[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScript = (): Promise<void> =>
      new Promise((resolve) => {
        if ((window as any).kakao?.maps?.MarkerClusterer) {
          resolve();
          return;
        }
        // 이미 스크립트가 로드됐지만 clusterer가 없는 경우 기존 스크립트 제거
        const existing = document.querySelector(
          `script[src*="dapi.kakao.com"]`,
        );
        if (existing) existing.remove();
        delete (window as any).kakao;

        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=clusterer`;
        script.onload = () => (window as any).kakao.maps.load(resolve);
        document.head.appendChild(script);
      });

    loadScript().then(() => {
      if (!mapRef.current) return;
      const kakao = (window as any).kakao;
      const defaultCenter = new kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);
      const map = new kakao.maps.Map(mapRef.current, {
        center: defaultCenter,
        level: 3,
      });

      requestAnimationFrame(() => {
        navigator.geolocation?.getCurrentPosition((pos) => {
          const currentCenter = new kakao.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          map.setCenter(currentCenter);
          new kakao.maps.Marker({
            map,
            position: currentCenter,
            title: "현재 위치",
          });
        });

        let openInfoWindow: any = null;

        const markerImage = new kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new kakao.maps.Size(24, 35),
        );

        const markers = foodLocations.map((item) => {
          const pos = new kakao.maps.LatLng(item.latitude, item.longitude);
          const marker = new kakao.maps.Marker({
            position: pos,
            image: markerImage,
            title: item.foodName,
          });

          const content = `
            <div style="padding:8px 12px;background:#1A1A1A;border-radius:8px;color:#fff;font-size:13px;line-height:1.6;min-width:120px;">
              <div style="font-weight:bold;color:#00C896;">${item.foodName}</div>
              <div style="color:#aaa;font-size:11px;">${Math.round(item.calories)} kcal · ${item.recordedAt}</div>
            </div>`;

          const infoWindow = new kakao.maps.InfoWindow({
            content,
            removable: true,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            if (openInfoWindow) openInfoWindow.close();
            infoWindow.open(map, marker);
            openInfoWindow = infoWindow;
          });

          return marker;
        });

        new kakao.maps.MarkerClusterer({
          map,
          markers,
          gridSize: 60,
          averageCenter: true,
          minLevel: 4,
          disableClickZoom: false,
          styles: [
            {
              width: "48px",
              height: "48px",
              background: "#00C896",
              borderRadius: "50%",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "15px",
              lineHeight: "48px",
              textAlign: "center",
              border: "2px solid #fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            },
          ],
        });
      });
    });
  }, [foodLocations]);

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

function NativeMap({ foodLocations }: { foodLocations: FoodLocation[] }) {
  const { WebView } = require("react-native-webview");
  return (
    <WebView
      javaScriptEnabled
      originWhitelist={["*"]}
      style={{ flex: 1 }}
      source={{
        html: KAKAO_MAP_HTML(foodLocations),
        baseUrl: "https://localhost",
      }}
    />
  );
}

export default function KakaoMap() {
  const [foodLocations, setFoodLocations] = useState<FoodLocation[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const token = await AsyncStorage.getItem("jwt_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/food/record/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: FoodLocation[] = await res.json();
          setFoodLocations(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLocations();
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <KakaoMapWeb foodLocations={foodLocations} />
      ) : (
        <NativeMap foodLocations={foodLocations} />
      )}

      <View
        style={
          Platform.OS === "web"
            ? ({ position: "fixed", top: 60, left: 20, zIndex: 100 } as any)
            : styles.topLeft
        }
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.push("/main")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
