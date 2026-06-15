import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = "http://192.168.x.x:8080";
const GOOGLE_CLIENT_ID = "여기에_구글_클라이언트_ID";

export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    },
    { authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth" },
  );

  return { request, response, promptAsync };
}

export async function saveToken(token: string) {
  await SecureStore.setItemAsync("jwt_token", token);
}

export async function getToken() {
  return await SecureStore.getItemAsync("jwt_token");
}

export async function removeToken() {
  await SecureStore.deleteItemAsync("jwt_token");
}
