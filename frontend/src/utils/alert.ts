import { Alert, Platform } from "react-native";

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
) {
  if (Platform.OS === "web") {
    const fullMessage = message ? `${title}\n${message}` : title;
    const cancelBtn = buttons?.find((b) => b.style === "cancel");
    const confirmBtn = buttons?.find((b) => b.style !== "cancel");

    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(fullMessage);
      if (confirmed) confirmBtn?.onPress?.();
      else cancelBtn?.onPress?.();
    } else {
      window.alert(fullMessage);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}
