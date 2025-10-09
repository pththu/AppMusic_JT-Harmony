import 'dotenv/config';

export default ({ config }) => ({
    ...config,
    extra: {
        ...config.extra,
        "eas": {
            "projectId": "d5918968-3bf6-466a-b726-07b812636bd3"
        },
        API_URL: process.env.API_URL || 'http://192.168.1.31:3000',
        GOOGLE_OAUTH_CLIENT_ID_APP: process.env.GOOGLE_OAUTH_CLIENT_ID_APP || "",
    },
});