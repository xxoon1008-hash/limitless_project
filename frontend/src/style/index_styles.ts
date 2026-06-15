import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.55)" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  titleContainer: { alignItems: "center", marginBottom: 50 },
  title: {
    fontSize: 52,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#ffffff",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 10,
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  pointText: {
    color: "#ff5252",
    fontWeight: "900",
  },
  contentContainer: { width: "100%" },
  formContainer: { marginBottom: 20 },

  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  inputFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "#ff5252",
  },

  buttonContainer: {},
  loginButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  googleImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
