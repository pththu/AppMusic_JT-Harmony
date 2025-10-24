import 'dotenv/config';

export default ({ config }) => ({
    ...config,
    extra: {
        ...config.extra,
        "eas": {
            "projectId": "d5918968-3bf6-466a-b726-07b812636bd3"
        },
        API_URL: process.env.API_URL || '',
        GOOGLE_OAUTH_WEB_CLIENT_ID_APP: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID_APP || "",
        FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
        FACEBOOK_CLIENT_TOKEN: process.env.FACEBOOK_CLIENT_TOKEN || '',
        FACEBOOK_DISPLAY_NAME: process.env.FACEBOOK_DISPLAY_NAME || '',
    },
    plugins: [
        [
            "react-native-fbsdk-next",
            {
                appID: process.env.FACEBOOK_APP_ID || '',
                clientToken: process.env.FACEBOOK_CLIENT_TOKEN,
                displayName: process.env.FACEBOOK_DISPLAY_NAME,
                scheme: process.env.FACEBOOK_APP_ID ? `fb${process.env.FACEBOOK_APP_ID}` : undefined
            },
        ],
        [
            "expo-image-picker",
            {
                "photosPermission": "Ứng dụng cần quyền truy cập thư viện ảnh để upload hình ảnh"
            }
        ],
        [
            "expo-document-picker"
        ],
        [
            "expo-audio",
            {
                "microphonePermission": "Allow to access your microphone."
            }
        ],
        [
            "expo-build-properties",
            {
                "android": {
                    "newArchEnabled": true
                }
            }
        ]
    ]
});