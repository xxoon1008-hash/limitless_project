import { Dimensions, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── 테마 토큰 ──────────────────────────────────────
const C = {
  bg: "#0A0F1E",
  card: "#131B2E",
  card2: "#1A2540",
  border: "rgba(255,255,255,0.07)",
  green: "#00C896",
  greenDim: "rgba(0,200,150,0.12)",
  orange: "#F97316",
  blue: "#60A5FA",
  text: "#E2E8F0",
  sub: "#64748B",
  white: "#FFFFFF",
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 100 },

  // ── 헤더 ───────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 22,
    marginBottom: 6,
  },
  headerGreeting: { fontSize: 14, color: C.sub, marginBottom: 2 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: C.green,
    fontStyle: "italic",
    letterSpacing: 1,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.greenDim,
    borderWidth: 1,
    borderColor: C.green + "40",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── 날짜 행 ──────────────────────────────────
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 18,
    gap: 10,
  },
  dateText: { fontSize: 15, color: C.sub },
  attendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.greenDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  attendedBadgeText: { fontSize: 12, color: C.green, fontWeight: "600" },

  // ── 칼로리 카드 ───────────────────────────────
  calorieCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  calorieCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  calorieCardLabel: { fontSize: 13, color: C.sub, marginBottom: 4 },
  calorieValueRow: { flexDirection: "row", alignItems: "flex-end" },
  calorieValueBig: {
    fontSize: 38,
    fontWeight: "800",
    color: C.text,
    lineHeight: 42,
  },
  calorieUnit: { fontSize: 14, color: C.sub, marginBottom: 6 },
  addFoodBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.green,
    justifyContent: "center",
    alignItems: "center",
  },

  // 진행 바
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: C.green,
    borderRadius: 3,
  },

  // 매크로 요약
  macroRow: { flexDirection: "row", justifyContent: "space-between" },
  macroItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  macroDot: { width: 8, height: 8, borderRadius: 4 },
  macroLabel: { fontSize: 12, color: C.sub },
  macroValue: { fontSize: 12, color: C.text, fontWeight: "600" },

  // ── 출석 버튼 ───────────────────────────────────
  attendanceButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: C.card2,
    borderRadius: 18,
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.green + "50",
  },
  attendanceButtonDone: {
    borderColor: C.green,
    backgroundColor: C.greenDim,
  },
  attendanceButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  attendanceButtonSub: { fontSize: 12, color: C.sub },
  errorText: { color: "#F87171", fontSize: 13, textAlign: "center", marginTop: 6 },

  // ── 달력 영역 ──────────────────────────────────
  calendarSection: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text, marginBottom: 2 },
  sectionSub: { fontSize: 13, color: C.sub, marginBottom: 12 },
  calendarBox: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: C.border,
  },

  // ── 하단 탭 ───────────────────────────────────
  bottomNav: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: C.card,
    width: "100%",
    paddingBottom: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navActiveIndicator: {
    position: "absolute",
    top: -10,
    width: 24,
    height: 3,
    backgroundColor: C.green,
    borderRadius: 2,
  },
  navLabel: { fontSize: 11, color: C.sub },
  navLabelActive: { fontSize: 11, color: C.green, fontWeight: "600" },

  // ── 모달 ──────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: C.text },
  modalSub: { fontSize: 13, color: C.sub, marginTop: 2 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: C.card,
    color: C.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchButton: {
    backgroundColor: C.green,
    padding: 13,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  // AI 결과 박스
  aiResultBox: {
    backgroundColor: C.card,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    minHeight: 140,
  },
  aiHintIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.greenDim,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  aiHintText: { color: C.sub, fontSize: 13, textAlign: "center", lineHeight: 20 },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  aiResultFoodName: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  aiResultServing: { color: C.sub, fontSize: 12, marginBottom: 10 },
  calorieHighlight: { flexDirection: "row", alignItems: "flex-end", marginBottom: 16 },
  calorieHighlightNum: {
    fontSize: 44,
    fontWeight: "900",
    color: C.green,
    lineHeight: 48,
  },
  calorieHighlightUnit: {
    fontSize: 18,
    color: C.green,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  aiNutrientRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
  aiNutrientItem: { alignItems: "center", flex: 1 },
  nutrientBar: {
    width: "100%",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 6,
  },
  nutrientBarValue: { fontSize: 15, fontWeight: "700" },
  aiNutrientLabel: { fontSize: 11, color: C.sub },

  // 저장 버튼
  saveFoodButton: {
    flexDirection: "row",
    backgroundColor: C.green,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveFoodButtonDisabled: { backgroundColor: "#1E293B" },
  saveFoodButtonText: { color: C.white, fontSize: 16, fontWeight: "700" },
});
