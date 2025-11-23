const { genAI } = require("../configs/gemini");
const { redisClient } = require("../configs/redis");
const Recommendation = require("../models/recommendation");
const { get } = require("../routes/recommendationsRoute");
const { getCached, setCache } = require("../utils/cache");

const MAX_RETRIES = 7; // Số lần thử lại tối đa cho các cuộc gọi API thất bại
const BASE_DELAY_MS = 1000;
const DEFAULT_TTL_SECONDS = 3600 * 24; // 2 giờ

// dd/MM/yyyy -> 31/12/2023
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// HH:mm -> 14:30
const formatHour = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
// sáng, trưa, chiều, tối, đêm
const convertTimeOfDay = (date) => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 10) return "sáng";
  if (hours >= 10 && hours < 13) return "trưa";
  if (hours >= 13 && hours < 17) return "chiều";
  if (hours >= 17 && hours < 22) return "tối";
  return "đêm";
}

/**
 * nhóm theo type và lấy theo ngày tạo gần nhất
 * type: playlist, artist, album, genre, track
 */

const getAllByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `recommendations-get:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (get recommendations)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (get recommendations)');
    const recommendations = await Recommendation.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 35,
    });
    const response = {
      message: "Thành công",
      success: true,
      data: recommendations,
    }
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: DEFAULT_TTL_SECONDS });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}

const createRecommendation = async (recommendation, userId) => {
  try {
    const data = {
      userId,
      ...recommendation
    }
    const newRec = await Recommendation.create(data);
    if (!newRec) {
      throw new Error("Tạo gợi ý thất bại");
    }
    return newRec;
  } catch (error) {
    throw error;
  }
}

/**
 * 1. TẠO GỢI Ý ÂM NHẠC DỰA TRÊN THÔNG TIN CỦA NGƯỜI DÙNG:
 * - Lịch sử nghe
 * - Tâm trạng
 * - Thể loại yêu thích
 * - Nghệ sĩ yêu thích
 * - Playlist gần đây
 * - Thời gian trong ngày
 * - Hoạt động hiện tại
 * NHIỆM VỤ: tạo ra các gợi ý tìm kiếm âm nhạc đa dạng và phong phú.
 * Model: gemini-2.5-flash
 * Flow: Tạo prompt chi tiết => gọi API với schema định nghĩa sẵn => parse và validate kết quả => cache kết quả
 * - Sử dụng retry với exponential backoff cho các lỗi tạm thời (503 Overloaded)
 * => trả về 15 gợi ý tìm kiếm âm nhạc
 */
const generateMusicRecommendations = async (req, res) => {
  try {
    console.log("🎵 GENERATE MUSIC RECOMMENDATIONS:", req.body);
    const {
      listeningHistory = [],
      mood = "",
      genres = [],
      favorites = [],
      followedArtists = [],
      timeOfDay = "",
      activity = "", // đi bộ, chạy bộ, học tập, làm việc, thư giãn, đọc sách
    } = req.body;

    // Tạo cache key
    const userId = req.user.id;
    const dateStr = new Date().toDateString(); // cache theo ngày
    const cacheKey = `recommendations:${userId}:${dateStr}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (generate recommendations)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (generate recommendations)');

    const formatListeningHistory = listeningHistory.slice(0, 10).map((item) => {
      return `${item.type} : ${item.name} - ${item.artists || item.description || ""} - ${item.playCount || 0} lần phát`;
    })

    const formatFavorites = favorites.map((item) => {
      return `${item.type} : ${item.name} - ${item.artists || item.description || ""}`;
    })

    // console.log('formatListeningHistory', formatListeningHistory)
    const userContext = `
      THÔNG TIN NGƯỜI DÙNG:
      - Lịch sử nghe gần đây: ${formatListeningHistory.length > 0 ? formatListeningHistory.join(", ") : "Chưa có dữ liệu"}
      - Tâm trạng hiện tại: ${mood || "Không xác định"}
      - Thể loại yêu thích: ${genres.length > 0 ? genres.join(", ") : "Tất cả thể loại"}
      - Nội dung yêu thích: ${formatFavorites.length > 0 ? formatFavorites.join(", ") : "Chưa có"}
      - Nghệ sĩ đã theo dõi: ${followedArtists.length > 0 ? followedArtists.join(", ") : "Chưa có"}
      - Thời gian trong ngày: ${timeOfDay || "Không xác định"}
      - Hoạt động đang thực hiện: ${activity || "Không xác định"}
              `.trim();

    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 35 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ.
      
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách giống với nghệ sĩ/ bài hát được nghe nhiều nhất trong lịch sử nghe của người dùng
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Mỗi lí do (reason) phải có đủ 5 gợi ý. Nghĩa là 5 gợi ý từ history, 5 từ mood, 5 từ genres, 5 từ favorites, 5 từ followedArtists, 5 từ timeOfDay, 5 từ activity
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp
      6. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      7. Ưu tiên type playlist, album, artist hơn track, genre
      8. Lí do gợi ý dựa trên nội dung đưa vào, gồm: history, mood, genres, favorites, followedArtists, timeOfDay, activity
      9. Các gợi ý phải khác với thông tin đã có trong lịch sử nghe, nội dung yêu thích và nghệ sĩ đã theo dõi của người dùng
      10. Mỗi gợi ý chỉ vì một lí do duy nhất.

      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "history",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "favoriteArtists",
          "confidence": 0.88
        }
      ]
      📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      📋 DANH SÁCH GENRES KHẢ DỤNG:
      v-pop, vinahouse, vietnam indie, vietnamese lo-fi, vietnamese hip hop,
      k-ballad, k-rap, k-rock, k-pop, rap, r&b, rock, pop rock, ballad,
      edm, electro house, mandopop, baroque pop, lo-fi, uk r&b, alternative r&b,
      taiwanese pop, chinese r&b, pop, c-pop, gufeng, hip hop,
      west coast hip hop, art pop, electropop, dance pop,
      modern rock, indie rock, indie pop, folk metal, j-r&b, folk metal, vocaloid,
      j-pop, anime, j-rock, soft pop, urban contemporary, japanese vgm, j-rap,
      metalcore, mathcore, enka, kayokyoku, city pop, future bass, metal rock, 
      jazz rap, jazz beats, nu jazz, neo soul japanese indie, cantopop,
      moombahton, japanese classical, ambient, drone, celtic, vietnamese bolero, bolero,
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): history, mood, genres, favorites, timeOfDay, activity, followedArtists
      BẮT ĐẦU TẠO NGAY:
          `.trim();

    // Định nghĩa schema
    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);

    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length !== 12) {
      console.warn("Số lượng gợi ý không đúng 12, nhưng tiếp tục: ", recommendations.length);
    }

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(recommendations), { EX: DEFAULT_TTL_SECONDS });

    res.status(200).json({
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("❌ Lỗi generateMusicRecommendations:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý âm nhạc",
      details: error.message
    });
  }
};

/**
 * Tạo đề xuất từ hoạt động của người dùng
 */
const GenerateRecommendationsFromActivity = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM ACTIVITY:", req.body);
    const { activity = "" } = req.body;

    let userId;
    if (!req.user || !req.user.id) {
      userId = "guest";
    } else {
      userId = req.user.id;
    }
    const cacheKey = `recommendations-activity:${userId}:${activity}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromActivity)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromActivity)');

    const userContext = `THÔNG TIN NGƯỜI DÙNG: Hoạt động hiện tại: ${activity || "Không xác định"}`.trim();
    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với hoạt động hiện tại của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách phù hợp với hoạt động người dùng đang làm.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là activity.
      7. Ưu tiên nhạc/nghệ sĩ Việt Nam.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "activity",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "activity",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): activity
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromActivity:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ hoạt động",
      data: error.message
    });
  }
}

const GenerateRecommendationsFromMood = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM MOOD:", req.body);
    const { mood = "" } = req.body;

    let userId;
    if (!req.user || !req.user.id) {
      userId = "guest";
    } else {
      userId = req.user.id;
    }
    const cacheKey = `recommendations-mood:${userId}:${mood}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromMood)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromMood)');

    const userContext = `THÔNG TIN NGƯỜI DÙNG: Tâm trạng hiện tại: ${mood || "Bình thường"}`.trim();
    const prompt = `
      Bạn là chuyên gia AI về âm nhạc và tâm trạng, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với tâm trạng hiện tại của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách phù hợp với tâm trạng người dùng đang có.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là mood.
      7. Ưu tiên nhạc/nghệ sĩ Việt Nam.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "mood",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "mood",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): mood
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromMood:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ tâm trạng",
      data: error.message
    });
  }
}

const GenerateRecommendationsFromGenres = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM GENRES:", req.body);
    const { genres = [] } = req.body;

    const userId = req.user.id;
    const cacheKey = `recommendations-genres:${userId}:${genres}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromGenres)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromGenres)');

    const userContext = `THÔNG TIN NGƯỜI DÙNG: Thể loại nhạc hiện tại: ${genres.length > 0 ? genres.join(", ") : "V-POP"}`.trim();
    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với thể loại yêu thích của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách phù hợp với thể loại yêu thích của người dùng.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là genres.
      7. Ưu tiên nhạc/nghệ sĩ Việt Nam.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "genres",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "genres",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): genres
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromGenres:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ thể loại",
      data: error.message
    });
  }
}

const GenerateRecommendationsFromFavorites = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM FAVORITES:");
    const { favorites = [] } = req.body;

    const userId = req.user.id;
    const cacheKey = `recommendations-favorites:${userId}:${new Date().toDateString()}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromFavorites)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromFavorites)');

    const formatFavorites = favorites.map((item) => {
      return `${item.type} : ${item.name} - ${item.artists || item.description || ""}`;
    }).join(", ");

    const userContext = `THÔNG TIN NGƯỜI DÙNG: Danh sách yêu thích của người dùng: ${favorites.length > 0 ? formatFavorites : "Chưa có danh sách yêu thích"}`.trim();
    const prompt = `
      Bạn là chuyên gia AI về âm nhạc và phân tích sở thích người dùng, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với danh sách yêu thích của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên bài hát/ nghệ sĩ có phong cách hoặc quốc gia phù hợp với danh sách yêu thích của người dùng.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là favorites.
      7. Ưu tiên nhạc/ nghệ sĩ có cùng quốc gia với danh sách nghệ sĩ/ bài hát yêu thích của người dùng.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "favorites",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "favorites",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): favorites
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromFavorites:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ danh sách yêu thích",
      data: error.message
    });
  }
}

const GenerateRecommendationsFromFollowedArtists = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM FOLLOWED ARTISTS:");
    const { followedArtists = [] } = req.body;

    const userId = req.user.id;
    const cacheKey = `recommendations-followedArtists:${userId}:${new Date().toDateString()}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromFollowedArtists)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromFollowedArtists)');

    const formatFollowedArtists = followedArtists.map((artist) => {
      return `${artist} - Theo dõi lúc ${artist.followedAt || "không rõ"}`;
    }).join(", ");

    const userContext = `THÔNG TIN NGƯỜI DÙNG: Danh sách nghệ sĩ theo dõi của người dùng: ${followedArtists.length > 0 ? formatFollowedArtists : "Chưa có nghệ sĩ theo dõi"}`.trim();
    const prompt = `
      Bạn là chuyên gia AI về âm nhạc và phân tích sở thích người dùng, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ trên toàn thế giới.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với danh sách nghệ sĩ theo dõi của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách hoặc quốc gia phù hợp với danh sách nghệ sĩ theo dõi của người dùng.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là followedArtists.
      7. Ưu tiên liên quan đến nghệ sĩ mới theo dõi.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "followedArtists",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "followedArtists",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): followedArtists
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromFollowedArtists:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ danh sách nghệ sĩ theo dõi",
      data: error.message
    });
  }
}

const GenerateRecommendationsFromHistories = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM HISTORIES:");
    const { listeningHistory = [] } = req.body;

    const userId = req.user.id;
    const cacheKey = `recommendations-histories:${userId}:${new Date().toDateString()}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromHistories)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromHistories)');

    const formatListeningHistory = listeningHistory.slice(0, 10).map((item) => {
      return `${item.type} : ${item.name} - ${item.artists || item.description || ""} - thời lượng phát: ${item.durationListened || 0} - ${item.playCount || 0} lần phát`;
    }).join("; ");

    const userContext = `THÔNG TIN NGƯỜI DÙNG: Lịch sử nghe nhạc của người dùng: ${listeningHistory.length > 0 ? formatListeningHistory : "Chưa có lịch sử nghe"}`.trim();
    const prompt = `
      Bạn là chuyên gia AI về âm nhạc và phân tích sở thích người dùng, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ trên toàn thế giới.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với lịch sử nghe nhạc của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách hoặc quốc gia phù hợp với lịch sử nghe nhạc của người dùng.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là history.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "history",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "history",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): history
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromHistory:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ lịch sử nghe nhạc",
      data: error.message
    });
  }
}

const GenerateRecommendationsFromTimeOfDay = async (req, res) => {
  try {
    console.log("🎯 CREATE RECOMMENDATIONS FROM TIME OF DAY:");

    let userId;
    if (!req.user || !req.user.id) {
      userId = "guest";
    } else {
      userId = req.user.id;
    }
    const timeOfDay = new Date();
    const cacheKey = `recommendations-timeOfDay:${userId}:${timeOfDay.toDateString()}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (createRecommendationsFromTimeOfDay)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (createRecommendationsFromTimeOfDay)');

    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ trên toàn thế giới.
      THÔNG TIN NGƯỜI DÙNG: Hiện tại là ${convertTimeOfDay(timeOfDay)}: ${timeOfDay.getHours()} giờ ${timeOfDay.getMinutes()} phút, ngày ${formatDate(timeOfDay)}.
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 5 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ phù hợp với thời gian của người dùng.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên nghệ sĩ/bài hát có phong cách hoặc quốc gia phù hợp với thời gian của người dùng.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Lí do chỉ có 1 là timeOfDay.
      
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "timeOfDay",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "timeOfDay",
          "confidence": 0.88
        }
      ]
        📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): timeOfDay
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // for (const rec of recommendations) {
    //   await createRecommendation(rec, req.user.id);
    // }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi createRecommendationsFromTimeOfDay:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý từ thời gian trong ngày",
      data: error.message
    });
  }
}

const GenerateRecommendForQueue = async (req, res) => {
  try {
    const { currentQueue = [], currentTrack } = req.body;
    console.log("🎯 CREATE RECOMMENDATIONS FOR CURRENT QUEUE:", currentQueue[0]);

    const userId = req.user ? req.user.id : "guest";
    const cacheKey = `recommendations:queue-${userId}-${currentTrack ? currentTrack.name : "noTrack"}-${currentQueue.length}-${new Date().toDateString()}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (GenerateRecommendForQueue)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (GenerateRecommendForQueue)');

    const formatQueue = currentQueue.map((item) => {
      return `${item.name} - ${item.artists.map(a => a.name).join(", ")}`;
    })

    const userContext = `THÔNG TIN HÀNG ĐỢI PHÁT: 
      ${formatQueue.length > 0 ? formatQueue.join(" | ") : "Hàng đợi phát trống"}
      BÀI HÁT HIỆN TẠI: ${currentTrack ? `${currentTrack.name} - ${currentTrack.artists.map(a => a.name).join(", ")}` : "Không có bài hát hiện tại"}
      `.trim();

    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ trên toàn thế giới.
      ${userContext}
      NHIỆM VỤ:
      Dựa vào danh sách hàng đợi phát và bài hát hiện tại, hãy tạo 10 gợi ý bài hát TIẾP THEO phù hợp để thêm vào hàng đợi phát.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên bài hát có cùng thể loại và quốc gia với phần lớn bài hát trong hàng đợi phát.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển.
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc.
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Tránh gợi ý các bài hát đã có trong hàng đợi phát.
      7. Tránh gợi ý những nghệ sĩ hoặc bài hát quá lỗi thời hoặc quá ít người biết đến, hoặc các khu vực quá xa lạ với sở thích chung của người dùng.
      8. Tập trung vào những bài hát của nghệ sĩ có trong hàng đợi phát hoặc các bài hát tương tự.
      9. Lí do chỉ có 1 là forQueue.
      10. Chỉ gợi ý bài hát (type: track).

      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
          {
            "type": "track",
            "name": "Âm thầm bên em",
            "artists": ["Sơn Tùng M-TP"],
            "reason": "addToPlaylist",
            "confidence": 0.95
          },
          {
            "type": "track",
            "name": "Butter",
            "artists": ["BTS"],
            "reason": "addToPlaylist",
            "confidence": 0.88
          }
        ]
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): forQueue
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["track"]).describe("Loại gợi ý."),
      name: z.string().describe("Tên bài hát"),
      artists: z.array(z.string()).describe("Danh sách nghệ sĩ"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    res.status(200).json(responseData);

  } catch (error) {
    res.status(500).json({
      error: "Không thể tạo gợi ý cho hàng đợi phát",
      data: error.message
    });
  }
}

/**
 * playlistDetails: {
 *  name: string,,
  * description: string,
  * length: number
 * }
 */
const GenerateRecommendForAddTrackToPlaylistBaseOnPlaylistTracks = async (req, res) => {
  try {
    const {
      playlistDetails = {},
      playlistTracks = []
    } = req.body;
    console.log("🎯 CREATE RECOMMENDATIONS FOR ADD TRACK TO PLAYLIST:", playlistDetails.name);
    const userId = req.user.id;

    const cacheKey = `recommendations-addTrackToPlaylist:${userId}:${playlistDetails.name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (GenerateRecommendForAddTrackToPlaylist)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (GenerateRecommendForAddTrackToPlaylist)');

    const formatPlaylistTracks = playlistTracks.slice(0, 30).map((item) => {
      return `${item.name} - ${item.artists.map(a => a.name).join(", ")}`;
    })

    const userContext = `THÔNG TIN PLAYLIST: 
      - Tên playlist: ${playlistDetails.name || "Không rõ"}
      - Mô tả: ${playlistDetails.description || "Không rõ"}
      - Một số bài hát tiêu biểu: ${formatPlaylistTracks.length > 0 ? formatPlaylistTracks.join(" | ") : "Chưa có bài hát"}
      `.trim();

    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ trên toàn thế giới.
      ${userContext}
      NHIỆM VỤ:
      Dựa vào thông tin danh sách phát và các bài hát tiêu biểu, hãy tạo 15 gợi ý bài hát PHÙ HỢP NHẤT để thêm vào playlist.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên bài hát có cùng thể loại và quốc gia với phần lớn bài hát trong playlist.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển.
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc.
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Tránh gợi ý các bài hát đã có trong playlist.
      7. Tránh gợi ý những nghệ sĩ hoặc bài hát quá lỗi thời hoặc quá ít người biết đến, hoặc các khu vực quá xa lạ với sở thích chung của người dùng.
      8. Chú trọng vào việc duy trì tâm trạng/chủ đề của playlist.

      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "track",
          "name": "Âm thầm bên em",
          "artists": ["Sơn Tùng M-TP"],
          "reason": "addToPlaylist",
          "confidence": 0.95
        },
        {
          "type": "track",
          "name": "Butter",
          "artists": ["BTS"],
          "reason": "addToPlaylist",
          "confidence": 0.88
        }
      ]
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): addToPlaylist
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["track"]).describe("Loại gợi ý."),
      name: z.string().describe("Tên bài hát"),
      artists: z.array(z.string()).describe("Danh sách nghệ sĩ"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({
      error: "Không thể tạo gợi ý thêm bài hát vào playlist",
      data: error.message
    });
  }
}

const GenerateRecommendForAddTrackToPlaylistBaseOnFavoriteTracks = async (req, res) => {
  try {
    const {
      favorites = [],
    } = req.body;

    console.log("🎯 CREATE RECOMMENDATIONS FOR ADD TRACK TO PLAYLIST BASED ON FAVORITE TRACKS")
    const userId = req.user.id;
    const cacheKey = `recommendations-addTrackToPlaylist-favorites:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (GenerateRecommendForAddTrackToPlaylistBaseOnFavoriteTracks)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (GenerateRecommendForAddTrackToPlaylistBaseOnFavoriteTracks)');

    const formatFavoritesItem = favorites.slice(0, 30).map((item) => {
      return `${item.itemType} : ${item.name} - ${item?.artists?.map(a => a?.name).join(", ") || item?.description || ""}`;
    })

    const userContext = `THÔNG TIN BÀI HÁT YÊU THÍCH: 
      - Một số nội dung yêu thích tiêu biểu: ${formatFavoritesItem.length > 0 ? formatFavoritesItem.join(" | ") : "Chưa có bài hát"}
      `.trim();

    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ trên toàn thế giới.
      ${userContext}
      NHIỆM VỤ:
      Dựa vào thông tin bài hát yêu thích, hãy tạo 15 gợi ý bài hát PHÙ HỢP NHẤT để thêm vào playlist.
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại.
      2. Ưu tiên bài hát có cùng thể loại và quốc gia với phần lớn bài hát yêu thích.
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển.
      4. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc.
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp.
      6. Tránh gợi ý các bài hát đã có trong danh sách yêu thích.
      7. Tránh gợi ý những nghệ sĩ hoặc bài hát quá lỗi thời hoặc quá ít người biết đến, hoặc các khu vực quá xa lạ với sở thích chung của người dùng.
      8. Chú trọng vào những bài hát của nghệ sĩ có trong danh sách yêu thích hoặc các bài hát tương tự.

      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "track",
          "name": "Âm thầm bên em",
          "artists": ["Sơn Tùng M-TP"],
          "reason": "addToPlaylist",
          "confidence": 0.95
        },
        {
          "type": "track",
          "name": "Butter",
          "artists": ["BTS"],
          "reason": "addToPlaylist",
          "confidence": 0.88
        }
      ]
      GIÁ TRỊ CỦA TRƯỜNG LÍ DO (REASON): addToPlaylist
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
    `.trim();

    const { z, date } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");
    const recommendationSchema = z.object({
      type: z.enum(["track"]).describe("Loại gợi ý."),
      name: z.string().describe("Tên bài hát"),
      artists: z.array(z.string()).describe("Danh sách nghệ sĩ"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });
    const recommendationsSchema = z.array(recommendationSchema);
    let response;
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🎵 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(recommendationsSchema),
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error; // Lưu lại lỗi
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);

          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break; // thoát vòng lặp
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể tạo gợi ý âm nhạc sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    if (recommendations.length === 0) {
      return res.status(200).json({
        message: "Không có gợi ý phù hợp",
        success: false,
      });
    }

    const responseData = {
      message: "Thành công",
      success: true,
      totalResults: recommendations.length,
      data: recommendations,
    };

    // Cache kết quả
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    res.status(200).json(responseData);


  } catch (error) {
    res.status(500).json({
      error: "Không thể tạo gợi ý thêm bài hát vào playlist",
      data: error.message
    });
  }
}

// ===========================================
// 2. PHÂN TÍCH TÂM TRẠNG/NĂNG LƯỢNG BÀI HÁT
// ===========================================

const analyzeSongMood = async (req, res) => {
  try {
    console.log("🎭 ANALYZE SONG MOOD:", req.body);

    const { songTitle, artistName, lyrics, genre } = req.body;

    if (!songTitle) {
      return res.status(400).json({ error: "⚠️ Thiếu tên bài hát" });
    }

    const prompt = `
Bạn là chuyên gia phân tích cảm xúc âm nhạc.

🎵 THÔNG TIN BÀI HÁT:
- Tên bài: ${songTitle}
- Nghệ sĩ: ${artistName || "Không rõ"}
- Thể loại: ${genre || "Không rõ"}
${lyrics ? `- Đoạn lyrics mẫu: ${lyrics.substring(0, 200)}...` : ""}

🎯 NHIỆM VỤ:
Phân tích và trả về JSON object với thông tin sau:

{
  "primaryMood": "happy/sad/energetic/chill/romantic/melancholic/angry/peaceful",
  "secondaryMood": "...",
  "energy": 0.0-1.0,
  "valence": 0.0-1.0,
  "danceability": 0.0-1.0,
  "tags": ["upbeat", "chill", "workout", "sleep", "party"],
  "bestTimeToListen": "morning/afternoon/evening/night/anytime",
  "activities": ["workout", "study", "driving", "relax", "party"],
  "emotionalDescription": "Mô tả ngắn gọn về cảm xúc bài hát"
}

📌 GIẢI THÍCH:
- energy: Mức năng lượng (0=rất chậm, 1=rất sôi động)
- valence: Tích cực/tiêu cực (0=buồn, 1=vui)
- danceability: Mức độ phù hợp để nhảy

Chỉ trả về JSON, không giải thích thêm.
        `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    res.json({ analysis });

  } catch (error) {
    console.error("❌ Lỗi analyzeSongMood:", error);
    res.status(500).json({
      error: "Không thể phân tích bài hát",
      details: error.message
    });
  }
};

// ===========================================
// 3. TẠO MÔ TẢ PLAYLIST TỰ ĐỘNG
// ===========================================
const generatePlaylistDescription = async (req, res) => {
  try {
    console.log("📝 GENERATE PLAYLIST DESCRIPTION:", req.body);

    const { playlistName, songs, genre, creator, mood } = req.body;

    if (!playlistName || !songs || songs.length === 0) {
      return res.status(400).json({
        error: "⚠️ Thiếu tên playlist hoặc danh sách bài hát"
      });
    }

    const songList = songs.slice(0, 10).map(s =>
      typeof s === 'string' ? s : `${s.title} - ${s.artist}`
    ).join("\n- ");

    const prompt = `
Bạn là chuyên gia viết nội dung marketing cho âm nhạc.

🎵 THÔNG TIN PLAYLIST:
- Tên: ${playlistName}
- Thể loại chính: ${genre || "Đa dạng"}
- Tâm trạng/Chủ đề: ${mood || "Không xác định"}
- Người tạo: ${creator || "Người dùng"}
- Số bài hát: ${songs.length}

📋 MỘT SỐ BÀI HÁT TIÊU BIỂU:
- ${songList}

🎯 NHIỆM VỤ:
Viết mô tả playlist chuyên nghiệp, hấp dẫn, dài 80-150 từ.

✅ YÊU CẦU:
1. Ngắn gọn, súc tích, không dài dòng
2. Tạo cảm xúc, khơi gợi trải nghiệm
3. Nhấn mạnh tâm trạng/hoạt động phù hợp
4. Không liệt kê tên bài hát
5. Viết bằng tiếng Việt tự nhiên
6. Có emoji phù hợp (1-2 emoji)

CHỈ TRẢ VỀ MÔ TẢ, KHÔNG GIẢI THÍCH HAY THÊM TIÊU ĐỀ.
        `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    res.json({ description });

  } catch (error) {
    console.error("❌ Lỗi generatePlaylistDescription:", error);
    res.status(500).json({
      error: "Không thể tạo mô tả playlist",
      details: error.message
    });
  }
};

// ===========================================
// 4. CHATBOT TÌM NHẠC THÔNG MINH
// ===========================================
const musicChatbot = async (req, res) => {
  try {
    console.log("💬 MUSIC CHATBOT:", req.body);

    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "⚠️ Thiếu nội dung tin nhắn" });
    }

    // Xây dựng context từ lịch sử hội thoại
    const historyContext = conversationHistory
      .slice(-5) // Lấy 5 tin nhắn gần nhất
      .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
      .join("\n");

    const prompt = `
Bạn là trợ lý AI thông minh chuyên về âm nhạc. Nhiệm vụ của bạn là:
1. Hiểu nhu cầu người dùng về âm nhạc
2. Gợi ý bài hát, nghệ sĩ, playlist phù hợp
3. Trò chuyện tự nhiên, thân thiện
4. Hỗ trợ cả nhạc Việt và quốc tế

📜 LỊCH SỬ HỘI THOẠI:
${historyContext || "Chưa có"}

💬 TIN NHẮN MỚI:
User: ${message}

🎯 HÃY TRẢ LỜI:
- Nếu hỏi tìm nhạc: Đề xuất 3-5 gợi ý cụ thể (tên bài/nghệ sĩ/playlist)
- Nếu hỏi về nghệ sĩ: Giới thiệu ngắn gọn và gợi ý bài hát nổi bật
- Nếu hỏi về thể loại: Giải thích và gợi ý đại diện
- Nếu chat thường: Trò chuyện tự nhiên, có liên quan đến âm nhạc

✅ PHONG CÁCH:
- Thân thiện, nhiệt tình
- Câu trả lời 50-150 từ
- Dùng emoji phù hợp (1-2 emoji)
- Viết bằng tiếng Việt

BẮT ĐẦU TRẢ LỜI:
        `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 800,
      }
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    res.json({ reply });

  } catch (error) {
    console.error("❌ Lỗi musicChatbot:", error);
    res.status(500).json({
      error: "Không thể xử lý tin nhắn",
      details: error.message
    });
  }
};

// ===========================================
// 5. GẮN TAGS TỰ ĐỘNG CHO BÀI HÁT
// ===========================================
const autoTagSong = async (req, res) => {
  try {
    console.log("🏷️ AUTO TAG SONG:", req.body);

    const { songTitle, artistName, genre, duration } = req.body;

    if (!songTitle) {
      return res.status(400).json({ error: "⚠️ Thiếu tên bài hát" });
    }

    const prompt = `
Bạn là hệ thống AI gắn tags cho bài hát.

🎵 THÔNG TIN:
- Bài hát: ${songTitle}
- Nghệ sĩ: ${artistName || "Không rõ"}
- Thể loại: ${genre || "Không rõ"}
- Thời lượng: ${duration || "Không rõ"}

🎯 NHIỆM VỤ:
Gắn 8-12 tags phù hợp cho bài hát này.

📋 DANH MỤC TAGS CÓ THỂ DÙNG:
Tâm trạng: chill, energetic, happy, sad, romantic, melancholic, peaceful, intense
Hoạt động: workout, study, sleep, party, driving, cooking, focus, relax
Thời gian: morning, afternoon, evening, night, sunrise, sunset
Thể loại: pop, rock, edm, ballad, hiphop, indie, acoustic, jazz
Năng lượng: upbeat, mellow, hype, slow, fast, powerful, gentle
Khác: trending, classic, viral, deep, nostalgic, motivational

Trả về JSON array đơn giản:
["tag1", "tag2", "tag3", ...]

Chỉ chọn tags phù hợp nhất, không tạo tags mới.
        `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 300,
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const tags = JSON.parse(cleanedText);

    res.json({ tags });

  } catch (error) {
    console.error("❌ Lỗi autoTagSong:", error);
    res.status(500).json({
      error: "Không thể gắn tags",
      details: error.message
    });
  }
};

// ===========================================
// 6. TẠO PLAYLIST TỪ TÂM TRẠNG/HOẠT ĐỘNG
// ===========================================
const generatePlaylistFromContext = async (req, res) => {
  try {
    console.log("🎨 GENERATE PLAYLIST FROM CONTEXT:", req.body);

    const { context, activity, duration, includeGenres, excludeGenres } = req.body;

    if (!context && !activity) {
      return res.status(400).json({
        error: "⚠️ Thiếu thông tin context hoặc activity"
      });
    }

    const prompt = `
Bạn là chuyên gia tạo playlist theo ngữ cảnh.

📍 YÊU CẦU:
- Tình huống/Tâm trạng: ${context || "Không xác định"}
- Hoạt động: ${activity || "Không xác ddingj"}
- Thời lượng mong muốn: ${duration || "30-60 phút"}
- Thể loại ưu tiên: ${includeGenres?.join(", ") || "Không giới hạn"}
- Thể loại loại trừ: ${excludeGenres?.join(", ") || "Không có"}

🎯 NHIỆM VỤ:
Tạo một playlist 15-20 bài hát phù hợp với ngữ cảnh trên.

📋 FORMAT JSON:
{
  "playlistName": "Tên playlist sáng tạo",
  "description": "Mô tả ngắn gọn",
  "totalDuration": "45 phút",
  "songs": [
    {
      "title": "Tên bài hát",
      "artist": "Tên nghệ sĩ",
      "reason": "Lý do chọn bài này"
    }
  ]
}

✅ YÊU CẦU:
- Ưu tiên bài hát Việt Nam nếu phù hợp
- Sắp xếp bài theo flow hợp lý (năng lượng tăng/giảm dần)
- Đa dạng nghệ sĩ, không lặp quá 2 bài cùng nghệ sĩ
- Chọn bài phổ biến, dễ tìm trên các nền tảng

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH.
        `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 3000,
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const playlist = JSON.parse(cleanedText);

    res.json({ playlist });

  } catch (error) {
    console.error("❌ Lỗi generatePlaylistFromContext:", error);
    res.status(500).json({
      error: "Không thể tạo playlist",
      details: error.message
    });
  }
};

// ===========================================
// EXPORT TẤT CẢ FUNCTIONS
// ===========================================
module.exports = {
  getAllByUser,
  generateMusicRecommendations,
  generatePlaylistDescription,
  generatePlaylistFromContext,
  analyzeSongMood,
  autoTagSong,
  musicChatbot,
  GenerateRecommendationsFromActivity,
  GenerateRecommendationsFromMood,
  GenerateRecommendationsFromFavorites,
  GenerateRecommendationsFromFollowedArtists,
  GenerateRecommendationsFromHistories,
  GenerateRecommendationsFromTimeOfDay,
  GenerateRecommendationsFromGenres,
  GenerateRecommendForQueue,
  GenerateRecommendForAddTrackToPlaylistBaseOnPlaylistTracks,
  GenerateRecommendForAddTrackToPlaylistBaseOnFavoriteTracks,
};