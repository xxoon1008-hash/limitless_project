import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.65)" }, // 입력 폼이 많아 텍스트가 잘 보이도록 조금 더 어둡게 처리
  scrollContainer: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: { fontSize: 16, color: "#e0e0e0", marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#e0e0e0", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  inputFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  submitButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  backButton: { alignItems: "center", marginTop: 20, paddingVertical: 10 },
  backButtonText: {
    color: "#cccccc",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
