import Constants from "expo-constants";

// console.log('Constants.expoConfig?.extra?.SOCKET_SERVER_URL', Constants.expoConfig?.extra?.SOCKET_SERVER_URL);

export const ENV = {
  API_URL: Constants.expoConfig?.extra?.API_URL as string,
  GOOGLE_OAUTH_WEB_CLIENT_ID_APP: Constants.expoConfig?.extra?.GOOGLE_OAUTH_WEB_CLIENT_ID_APP as string,
  FACEBOOK_APP_ID: Constants.expoConfig?.extra?.FACEBOOK_APP_ID as string,
  FACEBOOK_CLIENT_TOKEN: Constants.expoConfig?.extra?.FACEBOOK_CLIENT_TOKEN as string,
  FACEBOOK_DISPLAY_NAME: Constants.expoConfig?.extra?.FACEBOOK_DISPLAY_NAME as string,
  // SOCKET_SERVER_URL: Constants.expoConfig?.extra?.SOCKET_SERVER_URL as string,
  SOCKET_SERVER_URL: 'http://192.168.1.14:3001'
};