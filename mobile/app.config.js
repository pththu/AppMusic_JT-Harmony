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
});