const { genAI } = require("../configs/gemini");
const { getCached, setCache } = require("../utils/cache");

// const generateMusicRecommendations = async (req, res) => {
//   try {
//     console.log("🎵 GENERATE MUSIC RECOMMENDATIONS:", req.body);

//     const {
//       listeningHistory = [],
//       mood = "",
//       genres = [],
//       favoriteArtists = [],
//       recentPlaylists = [],
//       timeOfDay = "",
//       activity = ""
//     } = req.body;

//     // Tạo cache key
//     const cacheKey = `rec_${JSON.stringify({ mood, genres, activity })}`;
//     const cached = getCached(cacheKey); // Sử dụng service
//     if (cached) {
//       return res.json({ recommendations: cached, cached: true });
//     }

//     // Tạo context chi tiết
//     const userContext = `
// 📊 THÔNG TIN NGƯỜI DÙNG:
// - Lịch sử nghe gần đây: ${listeningHistory.length > 0 ? listeningHistory.slice(0, 10).join(", ") : "Chưa có dữ liệu"}
// - Tâm trạng hiện tại: ${mood || "Không xác định"}
// - Thể loại yêu thích: ${genres.length > 0 ? genres.join(", ") : "Tất cả thể loại"}
// - Nghệ sĩ yêu thích: ${favoriteArtists.length > 0 ? favoriteArtists.join(", ") : "Chưa có"}
// - Playlist gần đây: ${recentPlaylists.length > 0 ? recentPlaylists.join(", ") : "Chưa có"}
// - Thời gian trong ngày: ${timeOfDay || "Không xác định"}
// - Hoạt động đang thực hiện: ${activity || "Không xác định"}
//         `.trim();

//     const prompt = `
// Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.

// ${userContext}

// 🎯 NHIỆM VỤ:
// Dựa trên thông tin trên, hãy tạo 12 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ.

// 📋 QUY TẮC:
// 1. Mỗi gợi ý phải khác biệt và không lặp lại
// 2. Ưu tiên nghệ sĩ/bài hát Việt Nam nếu người dùng có nghe nhạc Việt
// 3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
// 4. Phải phù hợp với tâm trạng và hoạt động hiện tại
// 5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp

// 🔧 FORMAT OUTPUT:
// Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):

// [
//   {
//     "type": "playlist",
//     "query": "Chill Vibes 2024",
//     "reason": "Phù hợp với tâm trạng thư giãn",
//     "confidence": 0.95
//   },
//   {
//     "type": "artist",
//     "query": "Sơn Tùng M-TP",
//     "reason": "Nghệ sĩ V-Pop phổ biến",
//     "confidence": 0.88
//   }
// ]

// 📌 CÁC LOẠI TYPE:
// - "playlist": Gợi ý playlist theo chủ đề
// - "artist": Tên nghệ sĩ cụ thể
// - "album": Tên album cụ thể
// - "genre": Thể loại âm nhạc
// - "mood": Playlist theo tâm trạng
// - "song": Tên bài hát cụ thể

// Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.

// BẮT ĐẦU TẠO NGAY:
//         `.trim();

//     // Sử dụng genAI đã được import
//     const response = genAI.models.generateContent({
//       model: "gemini-2.5-flash",
//       generationConfig: {
//         temperature: 0.8,
//         maxOutputTokens: 2000,
//       },
//       contents: prompt
//     });

//     // console.log(1)
//     // const result = await model.generateContent(prompt);

//     console.log('result: ', response)
//     const responseText = response.response.text();
//     console.log(2)

//     // Parse JSON (xử lý trường hợp có markdown)
//     let recommendations;
//     try {
//       console.log(3)
//       console.log(responseText)
//       const cleanedText = responseText
//         .replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim();
//       recommendations = JSON.parse(cleanedText);
//       console.log(4)
//     } catch (parseError) {
//       console.log(5)
//       console.error("❌ JSON parse error:", responseText);
//       return res.status(500).json({
//         error: "Không thể parse kết quả từ AI",
//         rawResponse: responseText
//       });
//     }

//     // Validate kết quả
//     if (!Array.isArray(recommendations)) {
//       return res.status(500).json({ error: "Kết quả không đúng định dạng" });
//     }

//     // Cache kết quả
//     // setCache(cacheKey, recommendations); // Sử dụng service

//     res.json({
//       recommendations,
//       cached: false,
//       totalResults: recommendations.length
//     });

//   } catch (error) {
//     console.error("❌ Lỗi generateMusicRecommendations:", error);
//     res.status(500).json({
//       error: "Không thể tạo gợi ý âm nhạc",
//       details: error.message
//     });
//   }
// };

// ===========================================
// 2. PHÂN TÍCH TÂM TRẠNG/NĂNG LƯỢNG BÀI HÁT
// ===========================================

const generateMusicRecommendations = async (req, res) => {
  try {
    console.log("🎵 GENERATE MUSIC RECOMMENDATIONS:", req.body);
    const {
      listeningHistory = [],
      mood = "",
      genres = [],
      favoriteArtists = [],
      recentPlaylists = [],
      timeOfDay = "",
      activity = ""
    } = req.body;
    // Tạo cache key
    const cacheKey = `rec_${JSON.stringify({ mood, genres, activity })}`;
    const cached = getCached(cacheKey); // Sử dụng service
    if (cached) {
      return res.json({ recommendations: cached, cached: true });
    }

    // chuyển đổi các object thành string
    const formatListeningHistory = listeningHistory.slice(0, 10).map((item) => {
      return `${item.type} : ${item.name} - ${item.artists || item.description || ""} - ${item.playCount || 0} lần phát`;
    })

    console.log('formatListeningHistory', formatListeningHistory)
    // Tạo context chi tiết
    const userContext = `
      THÔNG TIN NGƯỜI DÙNG:
      - Lịch sử nghe gần đây: ${formatListeningHistory.length > 0 ? formatListeningHistory.join(", ") : "Chưa có dữ liệu"}
      - Tâm trạng hiện tại: ${mood || "Không xác định"}
      - Thể loại yêu thích: ${genres.length > 0 ? genres.join(", ") : "Tất cả thể loại"}
      - Nghệ sĩ yêu thích: ${favoriteArtists.length > 0 ? favoriteArtists.join(", ") : "Chưa có"}
      - Playlist gần đây: ${recentPlaylists.length > 0 ? recentPlaylists.join(", ") : "Chưa có"}
      - Thời gian trong ngày: ${timeOfDay || "Không xác định"}
      - Hoạt động đang thực hiện: ${activity || "Không xác định"}
              `.trim();

    const prompt = `
      Bạn là chuyên gia AI về âm nhạc, hiểu sâu về tất cả thể loại nhạc, nghệ sĩ Việt Nam và quốc tế.
      ${userContext}
      NHIỆM VỤ:
      Dựa trên thông tin trên, hãy tạo 15 gợi ý tìm kiếm âm nhạc ĐA DẠNG và PHONG PHÚ.
      
      QUY TẮC:
      1. Mỗi gợi ý phải khác biệt và không lặp lại
      2. Ưu tiên nghệ sĩ/bài hát có phong cách giống với nghệ sĩ/ bài hát được nghe nhiều nhất trong lịch sử nghe của người dùng
      3. Kết hợp cả nhạc mới (trending) và nhạc kinh điển
      4. Phải phù hợp với tâm trạng và hoạt động hiện tại
      5. Đưa ra cả gợi ý bất ngờ nhưng vẫn phù hợp
      6. Ưu tiên các gợi ý có tính khám phá cao, giúp người dùng mở rộng sở thích âm nhạc
      7. Ưu tiên type playlist, album, genre, artist hơn track
      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      [
        {
          "type": "playlist",
          "query": "Chill Vibes 2024",
          "reason": "Phù hợp với tâm trạng thư giãn",
          "confidence": 0.95
        },
        {
          "type": "artist",
          "query": "Sơn Tùng M-TP",
          "reason": "Nghệ sĩ V-Pop phổ biến",
          "confidence": 0.88
        }
      ]
      📌 CÁC LOẠI TYPE:
      - "playlist": Gợi ý playlist theo chủ đề
      - "artist": Tên nghệ sĩ cụ thể
      - "album": Tên album cụ thể
      - "genre": Thể loại âm nhạc
      - "track": Tên bài hát cụ thể
      Confidence: điểm từ 0.0 đến 1.0 thể hiện mức độ phù hợp.
      BẮT ĐẦU TẠO NGAY:
          `.trim();

    // Định nghĩa schema
    const { z } = require("zod");
    const { zodToJsonSchema } = require("zod-to-json-schema");

    const recommendationSchema = z.object({
      type: z.enum(["playlist", "artist", "album", "genre", "track"]).describe("Loại gợi ý."),
      query: z.string().describe("Truy vấn tìm kiếm"),
      reason: z.string().describe("Lý do cho gợi ý này."),
      confidence: z.number().min(0).max(1).describe("Điểm độ tin cậy từ 0.0 đến 1.0."),
    });

    const recommendationsSchema = z.array(recommendationSchema);

    // Sử dụng genAI đã được import
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
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

    // console.log('result: ', response);
    // console.log('content: ', response.candidates[0].content)

    const responseText = response.candidates[0].content.parts[0].text;

    // Parse với schema
    let recommendations;
    try {
      recommendations = recommendationsSchema.parse(JSON.parse(responseText));
      console.log(recommendations)
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        error: "Không thể parse hoặc validate kết quả từ AI",
        rawResponse: responseText
      });
    }

    // Validate thêm nếu cần (đã có schema)
    if (recommendations.length !== 12) {
      console.warn("Số lượng gợi ý không đúng 12, nhưng tiếp tục: ", recommendations.length);
    }

    // Cache kết quả
    // setCache(cacheKey, recommendations); // Sử dụng service

    res.json({
      recommendations,
      cached: false,
      totalResults: recommendations.length
    });
  } catch (error) {
    console.error("❌ Lỗi generateMusicRecommendations:", error);
    res.status(500).json({
      error: "Không thể tạo gợi ý âm nhạc",
      details: error.message
    });
  }
};

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
  generateMusicRecommendations,
  analyzeSongMood,
  generatePlaylistDescription,
  musicChatbot,
  autoTagSong,
  generatePlaylistFromContext
};