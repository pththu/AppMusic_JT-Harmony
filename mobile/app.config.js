import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    "eas": {
      "projectId": "d5918968-3bf6-466a-b726-07b812636bd3"
    },
    API_URL: process.env.API_URL || '',
    GOOGLE_OAUTH_CLIENT_ID_APP: process.env.GOOGLE_OAUTH_CLIENT_ID_APP || "",
  },
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookDisplayName: process.env.FACEBOOK_DISPLAY_NAME,
  facebookClientToken: process.env.FACEBOOK_CLIENT_TOKEN,
  plugins: [
    [
      "react-native-fbsdk-next",
      {
        appID: process.env.FACEBOOK_APP_ID,
        clientToken: process.env.FACEBOOK_CLIENT_TOKEN,
        displayName: process.env.FACEBOOK_DISPLAY_NAME,
        scheme: process.env.FACEBOOK_APP_ID ? `fb${process.env.FACEBOOK_APP_ID}` : undefined
      }
    ]
  ]
});