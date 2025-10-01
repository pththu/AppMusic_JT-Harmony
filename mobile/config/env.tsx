import Constants from "expo-constants";

export const ENV = {
  API_URL: Constants.expoConfig?.extra?.API_URL as string,
  GOOGLE_OAUTH_WEB_CLIENT_ID_APP: Constants.expoConfig?.extra?.GOOGLE_OAUTH_WEB_CLIENT_ID_APP as string,
};