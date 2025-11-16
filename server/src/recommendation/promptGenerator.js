/**
 * ============================================
 * PROMPT GENERATOR FOR GEMINI AI
 * ============================================
 * Tạo prompt tối ưu để Gemini generate music recommendations
 * 
 * Input: User profile + Collaborative data
 * Output: Structured prompt string
 */

class PromptGenerator {
  constructor(userProfile, collaborativeData) {
    this.profile = userProfile;
    this.collaborative = collaborativeData;

    console.log('📝 Khởi tạo Prompt Generator');
  }

  /**
   * PHẦN 1: FORMAT USER PROFILE
   * Chuyển data phức tạp thành text dễ đọc cho AI
   */
  formatUserProfile() {
    const profile = this.profile;

    return {
      // Top genres
      genres: profile.topGenres?.length > 0
        ? profile.topGenres.map(g => g.genre).join(', ')
        : 'Not enough data',

      // Top artists (chỉ lấy top 5)
      artists: profile.topArtists?.length > 0
        ? profile.topArtists.slice(0, 5).map(a => a.name).join(', ')
        : 'Not enough data',

      // Recent searches
      searches: profile.recentSearches?.length > 0
        ? profile.recentSearches.slice(0, 5).map(s => s.query).join(', ')
        : 'None',

      // Repeated tracks
      repeated: profile.repeatedTracks?.length > 0
        ? profile.repeatedTracks.map(t => `"${t.name}" by ${t.artist}`).join(', ')
        : 'None',

      // Current mood
      mood: profile.currentMood?.length > 0
        ? profile.currentMood.join(', ')
        : 'neutral',

      // Music features
      avgDuration: Math.round((profile.musicFeatures?.averageDuration || 0) / 1000),
      completionRate: ((profile.musicFeatures?.completionRate || 0) * 100).toFixed(0),
      explicitPref: (profile.musicFeatures?.explicitPreference || 0) > 0.5
        ? 'Preferred'
        : 'Mixed',

      // Behavior
      isActive: profile.behavior?.isActiveListener || false,
      isExplorer: (profile.behavior?.discoveryScore || 0) > 0.5,
      isRepeatListener: (profile.behavior?.repeatListenerScore || 0) > 0.3
    };
  }

  /**
   * PHẦN 2: FORMAT COLLABORATIVE DATA
   * Format recommendations từ similar users
   */
  formatCollaborativeData() {
    const collab = this.collaborative;

    if (!collab.hasSimilarUsers) {
      return {
        hasData: false,
        summary: 'Not enough users for collaborative filtering'
      };
    }

    return {
      hasData: true,
      similarUsersCount: collab.similarUsersCount,
      averageSimilarity: (collab.averageSimilarity * 100).toFixed(0),

      // Top artist recommendations
      topArtists: collab.artistRecommendations?.slice(0, 5).map(rec =>
        `${rec.name} (Match: ${(rec.normalizedScore * 100).toFixed(0)}%)`
      ).join(', ') || 'None',

      // Top genre recommendations
      topGenres: collab.genreRecommendations?.slice(0, 3).map(rec =>
        rec.genre
      ).join(', ') || 'None'
    };
  }

  /**
   * PHẦN 3: GENERATE MAIN PROMPT
   * Tạo prompt chính với tất cả thông tin
   */
  generateMainPrompt() {
    const formatted = this.formatUserProfile();
    const collabFormatted = this.formatCollaborativeData();

    const prompt = `You are an expert music recommendation AI specializing in personalized Spotify search queries.

    ## USER MUSIC PROFILE

    **Favorite Genres:** ${formatted.genres}
    **Top Artists:** ${formatted.artists}
    **Recent Searches:** ${formatted.searches}
    **Most Replayed Tracks:** ${formatted.repeated}
    **Current Mood:** ${formatted.mood}

    **Music Preferences:**
    - Average track length: ${formatted.avgDuration} seconds
    - Listening completion rate: ${formatted.completionRate}%
    - Explicit content preference: ${formatted.explicitPref}

    **User Behavior:**
    - Active listener: ${formatted.isActive ? 'Yes' : 'No'}
    - Music explorer: ${formatted.isExplorer ? 'Yes' : 'No'}
    - Repeat listener: ${formatted.isRepeatListener ? 'Yes' : 'No'}

    ${collabFormatted.hasData ? `
    ## COLLABORATIVE INSIGHTS
    Based on ${collabFormatted.similarUsersCount} similar users (${collabFormatted.averageSimilarity}% match):

    **Similar Users Are Listening To:**
    - Artists: ${collabFormatted.topArtists}
    - Genres: ${collabFormatted.topGenres}
    ` : ''}

    ## YOUR TASK

    Generate exactly 10 personalized Spotify search queries that will help this user discover new music they'll love.

    **Requirements:**
    1. Generate EXACTLY 10 queries (no more, no less)
    2. Mix of types: 4 artist names, 3 song titles, 2 playlists, 1 genre combination
    3. Balance: 60% familiar taste (similar to what they like) + 40% discovery (new but related)
    4. Match current mood: ${formatted.mood}
    5. Avoid these artists already in their top favorites: ${formatted.artists}
    6. All queries must be in ENGLISH for Spotify API compatibility
    7. Each query should be specific but not too narrow

    **Query Types Explained:**
    - "artist": A single artist name (e.g., "Stray Kids")
    - "track": A song title with optional artist (e.g., "Butter BTS")
    - "playlist": A playlist theme (e.g., "k-pop workout songs")
    - "genre": Genre combinations (e.g., "korean hip hop 2024")

    **Confidence Score Guide:**
    - 0.90-0.95: Perfect match based on user's core preferences
    - 0.80-0.89: Strong match with some exploration
    - 0.70-0.79: Good discovery potential, related to user taste

    ## OUTPUT FORMAT

    Respond with ONLY valid JSON. No markdown, no explanation, no code blocks (````). Just pure JSON:

    [
      {
        "query": "search term here",
        "type": "artist|track|playlist|genre",
        "reason": "brief explanation why this matches user",
        "confidence": 0.85
      }
    ]

    Start your response with [ and end with ]. Nothing else.`;

    return prompt;
  }

  /**
   * PHẦN 4: GENERATE SHORT PROMPT
   * Prompt ngắn gọn hơn (dùng khi cần tiết kiệm tokens)
   */
  generateShortPrompt() {
    const formatted = this.formatUserProfile();

    return `Generate 10 Spotify search queries for user who likes:
      - Genres: ${formatted.genres}
      - Artists: ${formatted.artists}
      - Mood: ${formatted.mood}

      Mix: 4 artists, 3 tracks, 2 playlists, 1 genre. Avoid: ${formatted.artists}.

      JSON format only:
      [{"query": "...", "type": "artist|track|playlist|genre", "reason": "...", "confidence": 0.85}]`;
  }

  /**
   * PHẦN 5: GENERATE FALLBACK PROMPT
   * Dùng khi user có rất ít data
   */
  generateFallbackPrompt() {
    const formatted = this.formatUserProfile();

    return `User has limited listening history.
      Current mood: ${formatted.mood}
      Recent searches: ${formatted.searches}

      Generate 10 diverse, popular Spotify search queries suitable for music discovery.
      Focus on trending artists and popular playlists.

      JSON format: [{"query": "...", "type": "...", "reason": "...", "confidence": 0.75}]`;
  }

  /**
   * PHẦN 6: AUTO-SELECT BEST PROMPT
   * Tự động chọn prompt phù hợp dựa trên data quality
   */
  generateOptimalPrompt() {
    const profile = this.profile;
    const hasGoodData =
      (profile.topArtists?.length || 0) >= 3 &&
      (profile.topGenres?.length || 0) >= 2;

    if (!hasGoodData) {
      console.log('📝 Using fallback prompt (limited user data)');
      return this.generateFallbackPrompt();
    }

    const tokenEstimate = this.estimateTokenCount();

    if (tokenEstimate > 1000) {
      console.log('📝 Using short prompt (token optimization)');
      return this.generateShortPrompt();
    }

    console.log('📝 Using full prompt (comprehensive analysis)');
    return this.generateMainPrompt();
  }

  /**
   * Helper: Ước tính số tokens
   */
  estimateTokenCount() {
    const prompt = this.generateMainPrompt();
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(prompt.length / 4);
  }

  /**
   * Helper: In preview của prompt
   */
  previewPrompt(maxLength = 500) {
    const prompt = this.generateMainPrompt();
    const preview = prompt.substring(0, maxLength);

    console.log('\n' + '='.repeat(50));
    console.log('PROMPT PREVIEW');
    console.log('='.repeat(50));
    console.log(preview + '...');
    console.log('='.repeat(50));
    console.log(`Full length: ${prompt.length} characters (~${this.estimateTokenCount()} tokens)`);
    console.log('='.repeat(50) + '\n');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate prompt output từ Gemini
 */
function validateGeminiResponse(response) {
  const errors = [];

  // Check if it's an array
  if (!Array.isArray(response)) {
    errors.push('Response must be an array');
    return { valid: false, errors };
  }

  // Check length
  if (response.length !== 10) {
    errors.push(`Expected 10 queries, got ${response.length}`);
  }

  // Check each item
  response.forEach((item, index) => {
    if (!item.query) {
      errors.push(`Item ${index}: missing 'query' field`);
    }
    if (!item.type) {
      errors.push(`Item ${index}: missing 'type' field`);
    }
    if (!['artist', 'track', 'playlist', 'genre'].includes(item.type)) {
      errors.push(`Item ${index}: invalid type '${item.type}'`);
    }
    if (!item.confidence || item.confidence < 0 || item.confidence > 1) {
      errors.push(`Item ${index}: invalid confidence ${item.confidence}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Count query types trong response
 */
function analyzeQueryTypes(response) {
  const typeCounts = {
    artist: 0,
    track: 0,
    playlist: 0,
    genre: 0
  };

  response.forEach(item => {
    if (item.type && typeCounts.hasOwnProperty(item.type)) {
      typeCounts[item.type]++;
    }
  });

  return typeCounts;
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PromptGenerator,
    validateGeminiResponse,
    analyzeQueryTypes
  };
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
// User profile từ UserAnalyzer
const userProfile = {
  topGenres: [
    { genre: 'k-pop', count: 25 },
    { genre: 'j-pop', count: 15 }
  ],
  topArtists: [
    { name: 'BTS', score: 20 },
    { name: 'IU', score: 15 }
  ],
  currentMood: ['happy', 'energetic'],
  // ... more fields
};

// Collaborative data từ CollaborativeFilter
const collaborativeData = {
  hasSimilarUsers: true,
  similarUsersCount: 5,
  averageSimilarity: 0.65,
  artistRecommendations: [
    { name: 'Stray Kids', normalizedScore: 0.85 }
  ]
};

// Tạo generator
const generator = new PromptGenerator(userProfile, collaborativeData);

// Generate prompt
const prompt = generator.generateOptimalPrompt();
console.log(prompt);

// Preview
generator.previewPrompt();

// Sau khi có response từ Gemini
const geminiResponse = [...]; // JSON array từ Gemini
const validation = validateGeminiResponse(geminiResponse);
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);

const typeAnalysis = analyzeQueryTypes(geminiResponse);
console.log('Query types:', typeAnalysis);
*/