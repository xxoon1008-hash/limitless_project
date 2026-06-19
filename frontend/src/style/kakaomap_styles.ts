import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topLeft: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingVertical: 15,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomLeft: {
    position: "absolute",
    bottom: 40,
    left: 20,
  },
  bottomRight: {
    position: "absolute",
    bottom: 40,
    right: 20,
  },
  outlineText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#000000",
    textShadowColor: "rgba(255, 255, 255, 1)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
