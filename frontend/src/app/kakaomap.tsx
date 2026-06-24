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

type GroupedLocation = {
  latitude: number;
  longitude: number;
  items: FoodLocation[];
};

function groupByCoord(locations: FoodLocation[]): GroupedLocation[] {
  const map = new Map<string, GroupedLocation>();
  for (const item of locations) {
    const key = `${item.latitude},${item.longitude}`;
    if (!map.has(key)) {
      map.set(key, { latitude: item.latitude, longitude: item.longitude, items: [] });
    }
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
}

const KAKAO_MAP_HTML = (groups: GroupedLocation[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; }
    #map { position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
    .iw {
      padding: 10px 14px;
      background: #1A1A1A;
      border-radius: 10px;
      color: #fff;
      font-size: 13px;
      line-height: 1.8;
      min-width: 140px;
      max-width: 220px;
    }
    .iw-date { color: #00C896; font-weight: bold; font-size: 11px; margin-bottom: 4px; }
    .iw-row { display: flex; justify-content: space-between; gap: 12px; }
    .iw-name { flex: 1; }
    .iw-cal { color: #aaa; font-size: 11px; white-space: nowrap; }
    .iw-divider { border: none; border-top: 1px solid #333; margin: 4px 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}"></script>
  <script type="text/javascript">
    var container = document.getElementById("map");
    var map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(${DEFAULT_LAT}, ${DEFAULT_LNG}),
      level: 3,
    });

    navigator.geolocation && navigator.geolocation.getCurrentPosition(function(pos) {
      var c = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.setCenter(c);
      new kakao.maps.Marker({ map: map, position: c, title: "현재 위치" });
    });

    var groups = ${JSON.stringify(groups)};
    var openInfoWindow = null;

    var markerImage = new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new kakao.maps.Size(24, 35)
    );

    groups.forEach(function(group) {
      var pos = new kakao.maps.LatLng(group.latitude, group.longitude);
      var marker = new kakao.maps.Marker({ map: map, position: pos, image: markerImage });

      var rows = group.items.map(function(item, i) {
        var divider = i > 0 ? '<hr class="iw-divider">' : '';
        return divider +
          '<div class="iw-date">' + item.recordedAt + '</div>' +
          '<div class="iw-row">' +
          '<span class="iw-name">' + item.foodName + '</span>' +
          '<span class="iw-cal">' + Math.round(item.calories) + ' kcal</span>' +
          '</div>';
      }).join('');

      var content = '<div class="iw">' + rows + '</div>';
      var infoWindow = new kakao.maps.InfoWindow({ content: content, removable: true });

      kakao.maps.event.addListener(marker, 'click', function() {
        if (openInfoWindow) openInfoWindow.close();
        infoWindow.open(map, marker);
        openInfoWindow = infoWindow;
      });
    });
  </script>
</body>
</html>
`;

function KakaoMapWeb({ groups }: { groups: GroupedLocation[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScript = (): Promise<void> =>
      new Promise((resolve) => {
        if ((window as any).kakao?.maps) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
        script.onload = () => (window as any).kakao.maps.load(resolve);
        document.head.appendChild(script);
      });

    loadScript().then(() => {
      if (!mapRef.current) return;
      const kakao = (window as any).kakao;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG),
        level: 3,
      });

      requestAnimationFrame(() => {
        navigator.geolocation?.getCurrentPosition((pos) => {
          const c = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(c);
          new kakao.maps.Marker({ map, position: c, title: "현재 위치" });
        });

        const markerImage = new kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new kakao.maps.Size(24, 35),
        );

        let openInfoWindow: any = null;

        groups.forEach((group) => {
          const pos = new kakao.maps.LatLng(group.latitude, group.longitude);
          const marker = new kakao.maps.Marker({ map, position: pos, image: markerImage });

          const rows = group.items
            .map((item, i) => {
              const divider = i > 0 ? '<hr style="border:none;border-top:1px solid #333;margin:4px 0;">' : "";
              return (
                divider +
                `<div style="color:#00C896;font-weight:bold;font-size:11px;margin-bottom:2px;">${item.recordedAt}</div>` +
                `<div style="display:flex;justify-content:space-between;gap:12px;">` +
                `<span>${item.foodName}</span>` +
                `<span style="color:#aaa;font-size:11px;white-space:nowrap;">${Math.round(item.calories)} kcal</span>` +
                `</div>`
              );
            })
            .join("");

          const content = `<div style="padding:10px 14px;background:#1A1A1A;border-radius:10px;color:#fff;font-size:13px;line-height:1.8;min-width:140px;max-width:220px;">${rows}</div>`;

          const infoWindow = new kakao.maps.InfoWindow({ content, removable: true });

          kakao.maps.event.addListener(marker, "click", () => {
            if (openInfoWindow) openInfoWindow.close();
            infoWindow.open(map, marker);
            openInfoWindow = infoWindow;
          });
        });
      });
    });
  }, [groups]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}

function NativeMap({ groups }: { groups: GroupedLocation[] }) {
  const { WebView } = require("react-native-webview");
  return (
    <WebView
      javaScriptEnabled
      originWhitelist={["*"]}
      style={{ flex: 1 }}
      source={{ html: KAKAO_MAP_HTML(groups), baseUrl: "https://localhost" }}
    />
  );
}

export default function KakaoMap() {
  const [groups, setGroups] = useState<GroupedLocation[]>([]);

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
          setGroups(groupByCoord(data));
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
        <KakaoMapWeb groups={groups} />
      ) : (
        <NativeMap groups={groups} />
      )}

      <View
        style={
          Platform.OS === "web"
            ? ({ position: "fixed", top: 60, left: 20, zIndex: 100 } as any)
            : styles.topLeft
        }
      >
        <TouchableOpacity
          style={{ width: 44, height: 44, justifyContent: "center", alignItems: "center" }}
          onPress={() => router.push("/main")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
