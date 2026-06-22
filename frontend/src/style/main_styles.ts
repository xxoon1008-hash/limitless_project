import { Dimensions, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#262626" },
  scrollContent: { paddingBottom: 100 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF5252",
    fontStyle: "italic",
  },
  headerDate: { fontSize: 16, color: "#A0A0A0", marginTop: 4 },
  calendarBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
  },
  attendanceSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  attendanceButton: {
    flexDirection: "row",
    backgroundColor: "#FF5252",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  completedButton: { backgroundColor: "#4CAF50" },
  attendanceText: { color: "white", fontSize: 18, fontWeight: "bold" },
  message: {
    color: "#FF5252",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  calorieBox: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  infoCard: {
    flex: 0.48,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  infoLabel: { color: "#A0A0A0", fontSize: 12, marginTop: 8 },
  infoValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  unit: { fontSize: 12, color: "#A0A0A0" },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    width: "100%",
    paddingVertical: 15,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },

  // ── 모달 ──────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1c1c1c",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 36,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#FF5252",
    padding: 13,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── AI 결과 박스 ──────────────────────────────────
  aiResultBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
    marginBottom: 16,
    minHeight: 140,
  },
  aiResultText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
  },
  aiResultFoodName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  aiResultServing: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 10,
  },
  aiResultCalorieRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  aiResultCalorieValue: {
    color: "#FF5252",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
  },
  aiResultCalorieUnit: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  aiNutrientRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  aiNutrientItem: {
    alignItems: "center",
    flex: 1,
  },
  aiNutrientDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  aiNutrientLabel: {
    color: "#A0A0A0",
    fontSize: 11,
    marginBottom: 3,
  },
  aiNutrientValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  // ── 저장 버튼 ─────────────────────────────────────
  saveFoodButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveFoodButtonDisabled: {
    backgroundColor: "#444",
  },
  saveFoodButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
