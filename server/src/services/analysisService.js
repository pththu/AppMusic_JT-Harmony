// 1. Load biến môi trường NGAY LẬP TỨC
require('dotenv').config();

// 2. Import các hàm riêng lẻ thay vì class HfInference (Fix lỗi gạch ngang)
const {
    textClassification,
    imageClassification,
    automaticSpeechRecognition
} = require('@huggingface/inference');

const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs-extra');
const path = require('path');

// Cấu hình
ffmpeg.setFfmpegPath(ffmpegPath);

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
    console.warn("⚠️ CẢNH BÁO: Không tìm thấy HF_TOKEN. Tính năng AI sẽ không hoạt động!");
}

// Ngưỡng quyết định
const THRESHOLD = 0.7;

const KEYWORD_DICTIONARY = {
    toxic: [
        /\bngu\b/i, /\bstupid\b/i, /\bidiot\b/i, /\bdumb\b/i, /\bkhùng\b/i, /\bđiên\b/i,
        /\bóc chó\b/i, /\brác rưởi\b/i, /\btrash\b/i, /\buseless\b/i, /\bvô dụng\b/i,
        /\bđấm\b/i, /\bmẹ mày\b/i,
    ],
    obscene: [
        /\bđịt\b/i, /\bđụ\b/i, /\blồn\b/i, /\bbuồi\b/i, /\bcặc\b/i, /\bdái\b/i,
        /\bfuck\b/i, /\bshit\b/i, /\bpussy\b/i, /\bdick\b/i, /\bcock\b/i, /\basshole\b/i,
        /\bdume\b/i, /\bduma\b/i, /\bđm\b/i, /\bdkm\b/i, /\bvcl\b/i, /\bđéo\b/i, /\bđek\b/i, /\bvl\b/i,
        /\bmã cha\b/i, /\bmã mẹ\b/i
    ],
    threat: [
        /\bgiết\b/i, /\bđi chết\b/i, /\bchết đi\b/i, /\bkill\b/i, /\bđâm\b/i, /\bstab\b/i, /\bchém\b/i, /\bbắn\b/i, /\bshoot\b/i,
        /\bđánh chết\b/i, /\bbeat you\b/i, /\btao biết nhà mày\b/i, /\bfind you\b/i, /\bdie\b/i
    ],
    insult: [
        /\bnhư chó\b/i, /\bheo\b/i, /\bpig\b/i, /\bbitch\b/i, /\bwhore\b/i, /\bslut\b/i,
        /\bphò\b/i, /\bđiếm\b/i, /\bsúc vật\b/i, /\banimal\b/i, /\bfat\b/i, /\bugly\b/i, /\bxấu xí\b/i
    ],
    self_harm: [
        /\btự tử\b/i, /\bsuicide\b/i, /\btự sát\b/i, /\brạch tay\b/i, /\bcut myself\b/i,
        /\bmuốn chết\b/i, /\bwant to die\b/i, /\bkill myself\b/i, /\bend my life\b/i
    ],
    adult_content: [
        /\bsex\b/i, /\bporn\b/i, /\bhentai\b/i, /\bnude\b/i, /\bkhỏa thân\b/i,
        /\bthủ dâm\b/i, /\bmasturbate\b/i, /\bloạn luân\b/i, /\bincest\b/i, /\b18\+\b/i,
        /\bquan hệ\b/i, /\bjav\b/i, /\bxxx\b/i
    ]
};

// ================= HELPER FUNCTIONS =================

const downloadFileToBuffer = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        console.error(`[AI] Lỗi tải file: ${error.message}`);
        return null;
    }
};

const getActiveFlagsAI = (predictions, targetLabels = []) => {
    if (!predictions || !Array.isArray(predictions)) return [];

    let flatPredictions = Array.isArray(predictions[0]) ? predictions[0] : predictions;

    return flatPredictions
        .filter(item => targetLabels.includes(item.label) && item.score > THRESHOLD)
        .map(item => {
            if (item.label === 'nsfw') return 'adult_content';
            return item.label;
        });
};

const scanTextManual = (text) => {
    if (!text) return { hasWarning: false, flags: [] };
    const normalizedText = text.toLowerCase();
    const detectedFlags = new Set();

    for (const [label, regexList] of Object.entries(KEYWORD_DICTIONARY)) {
        for (const regex of regexList) {
            if (regex.test(normalizedText)) {
                detectedFlags.add(label);
                break;
            }
        }
    }

    const uniqueFlags = Array.from(detectedFlags);
    if (uniqueFlags.length > 0) {
        console.log(`[Keyword Scan] Phát hiện từ khóa trong "${text}":`, uniqueFlags);
    }
    return { hasWarning: uniqueFlags.length > 0, flags: uniqueFlags };
};

// ================= CORE FUNCTIONS =================

const analysisService = {
    // 1. TEXT
    analyzeText: async (text) => {
        return scanTextManual(text);
    },

    // 2. IMAGE (Dùng imageClassification trực tiếp)
    analyzeImage: async (imageUrl) => {
        try {
            if (!HF_TOKEN) return { hasWarning: false, flags: [] };
            const imageBuffer = await downloadFileToBuffer(imageUrl);
            if (!imageBuffer) return { hasWarning: false, flags: [] };

            // Gọi hàm trực tiếp, truyền token vào accessToken
            const result = await imageClassification({
                model: 'Falconsai/nsfw_image_detection',
                data: imageBuffer,
                accessToken: HF_TOKEN
            });

            console.log('[AI Image Result]:', result);
            const detectedFlags = getActiveFlagsAI(result, ['nsfw']);

            return { hasWarning: detectedFlags.length > 0, flags: detectedFlags };
        } catch (error) {
            console.error('[AI] Image Analysis Error:', error.message);
            return { hasWarning: false, flags: [] };
        }
    },

    // 3. AUDIO (Dùng automaticSpeechRecognition trực tiếp)
    analyzeAudio: async (audioUrl) => {
        try {
            if (!HF_TOKEN) {
                console.error('[AI] Lỗi: Thiếu Token, bỏ qua Audio.');
                return { hasWarning: false, flags: [] };
            }
            const audioBuffer = await downloadFileToBuffer(audioUrl);
            if (!audioBuffer) return { hasWarning: false, flags: [] };

            // FIX QUAN TRỌNG: Gọi hàm trực tiếp và truyền accessToken
            const transcription = await automaticSpeechRecognition({
                model: 'openai/whisper-large-v3-turbo',
                data: audioBuffer,
                provider: "hf-inference",
                accessToken: HF_TOKEN
            });

            const text = transcription.text;
            console.log(`[AI] Audio Transcript: "${text}"`);

            if (!text || text.length < 2) return { hasWarning: false, flags: [] };
            return scanTextManual(text);

        } catch (error) {
            console.error('[AI] Audio Analysis Error:', error.message);
            return { hasWarning: false, flags: [] };
        }
    },

    // 4. VIDEO
    analyzeVideo: async (videoUrl) => {
        const tempDir = path.join(__dirname, '../../temp_frames');
        await fs.ensureDir(tempDir);
        let allFlags = new Set();

        try {
            await new Promise((resolve, reject) => {
                let screenshots = [];
                ffmpeg(videoUrl)
                    .screenshots({
                        count: 3,
                        folder: tempDir,
                        filename: 'thumb-%s.png',
                        size: '320x240'
                    })
                    .on('filenames', (filenames) => screenshots = filenames.map(f => path.join(tempDir, f)))
                    .on('end', async () => {
                        if (HF_TOKEN) {
                            for (const file of screenshots) {
                                try {
                                    const imageBuffer = await fs.readFile(file);
                                    // Gọi hàm trực tiếp
                                    const result = await imageClassification({
                                        model: 'Falconsai/nsfw_image_detection',
                                        data: imageBuffer,
                                        accessToken: HF_TOKEN
                                    });
                                    const flags = getActiveFlagsAI(result, ['nsfw']);
                                    flags.forEach(f => allFlags.add(f));
                                } catch (e) { }
                            }
                        }
                        resolve();
                    })
                    .on('error', (err) => resolve());
            });

            await fs.emptyDir(tempDir);
            const finalFlags = Array.from(allFlags);
            return { hasWarning: finalFlags.length > 0, flags: finalFlags };

        } catch (error) {
            console.error('[AI] Video Analysis Error:', error.message);
            await fs.emptyDir(tempDir);
            return { hasWarning: false, flags: [] };
        }
    }
};

module.exports = analysisService;