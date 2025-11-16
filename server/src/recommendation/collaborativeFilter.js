/**
 * ============================================
 * COLLABORATIVE FILTERING MODULE
 * ============================================
 * Tìm users tương tự và lấy recommendations từ họ
 * 
 * Cách hoạt động:
 * 1. So sánh current user với các users khác
 * 2. Tính độ tương đồng (similarity score)
 * 3. Lấy top items từ similar users
 * 4. Gợi ý những gì current user chưa nghe
 */

class CollaborativeFilter {
  constructor(currentUserProfile, allUsersData = []) {
    this.currentUser = currentUserProfile;
    this.allUsers = allUsersData;

    console.log('🤝 Khởi tạo Collaborative Filter');
    console.log(`   - Current user có ${this.currentUser.topArtists?.length || 0} top artists`);
    console.log(`   - So sánh với ${this.allUsers.length} users khác`);
  }

  /**
   * PHẦN 1: TÍNH ĐỘ TƯƠNG ĐỒNG GIỮA 2 USERS
   * Sử dụng Jaccard Similarity cho artists
   * 
   * Formula: Intersection / Union
   * Ví dụ:
   * User A: [BTS, BlackPink, IU]
   * User B: [BTS, IU, Twice]
   * Intersection: [BTS, IU] = 2
   * Union: [BTS, BlackPink, IU, Twice] = 4
   * Similarity: 2/4 = 0.5 (50%)
   */
  calculateArtistSimilarity(artists1, artists2) {
    if (!artists1?.length || !artists2?.length) {
      return 0;
    }

    // Tạo Set của spotify IDs
    const set1 = new Set(artists1.map(a => a.spotifyId));
    const set2 = new Set(artists2.map(a => a.spotifyId));

    // Tìm intersection (chung)
    const intersection = [...set1].filter(id => set2.has(id)).length;

    // Tìm union (tổng không trùng)
    const union = new Set([...set1, ...set2]).size;

    // Tránh chia cho 0
    return union > 0 ? intersection / union : 0;
  }

  /**
   * PHẦN 2: TÍNH ĐỘ TƯƠNG ĐỒNG GIỮA GENRES
   * Tương tự như artists nhưng với genres
   */
  calculateGenreSimilarity(genres1, genres2) {
    if (!genres1?.length || !genres2?.length) {
      return 0;
    }

    const set1 = new Set(genres1.map(g => g.genre));
    const set2 = new Set(genres2.map(g => g.genre));

    const intersection = [...set1].filter(g => set2.has(g)).length;
    const union = new Set([...set1, ...set2]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * PHẦN 3: TÍNH OVERALL SIMILARITY
   * Kết hợp similarity của artists và genres
   * 
   * Weight: Artists = 70%, Genres = 30%
   */
  calculateOverallSimilarity(user1, user2) {
    const artistSim = this.calculateArtistSimilarity(
      user1.topArtists,
      user2.topArtists
    );

    const genreSim = this.calculateGenreSimilarity(
      user1.topGenres,
      user2.topGenres
    );

    // Weighted average
    const overallSim = (artistSim * 0.7) + (genreSim * 0.3);

    return overallSim;
  }

  /**
   * PHẦN 4: TÌM USERS TƯƠNG TỰ
   * Tìm top N users có similarity cao nhất
   */
  findSimilarUsers(minSimilarity = 0.15, maxUsers = 10) {
    console.log('\n🔍 Tìm similar users...');
    console.log(`   - Min similarity: ${(minSimilarity * 100).toFixed(0)}%`);
    console.log(`   - Max users: ${maxUsers}`);

    const similarUsers = this.allUsers
      .map(user => {
        const similarity = this.calculateOverallSimilarity(
          this.currentUser,
          user
        );

        return {
          userId: user.userId,
          similarity: similarity,
          topArtists: user.topArtists || [],
          topGenres: user.topGenres || []
        };
      })
      .filter(user => user.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxUsers);

    console.log(`   ✓ Tìm thấy ${similarUsers.length} similar users`);
    
    if (similarUsers.length > 0) {
      const avgSim = similarUsers.reduce((sum, u) => sum + u.similarity, 0) / similarUsers.length;
      console.log(`   ✓ Average similarity: ${(avgSim * 100).toFixed(1)}%`);
      console.log(`   ✓ Top similarity: ${(similarUsers[0].similarity * 100).toFixed(1)}%`);
    }

    return similarUsers;
  }

  /**
   * PHẦN 5: LẤY ARTIST RECOMMENDATIONS TỪ SIMILAR USERS
   * Lấy artists từ similar users mà current user chưa nghe
   */
  getArtistRecommendations(similarUsers) {
    console.log('\n🎤 Lấy artist recommendations...');

    // Tạo Set các artist IDs mà current user đã biết
    const knownArtistIds = new Set(
      this.currentUser.topArtists?.map(a => a.spotifyId) || []
    );

    const recommendations = {};

    similarUsers.forEach(user => {
      user.topArtists.forEach(artist => {
        // Chỉ recommend artist mà current user chưa nghe
        if (!knownArtistIds.has(artist.spotifyId)) {
          if (!recommendations[artist.spotifyId]) {
            recommendations[artist.spotifyId] = {
              spotifyId: artist.spotifyId,
              name: artist.name,
              imageUrl: artist.imageUrl,
              score: 0,
              recommendedBy: []
            };
          }

          // Score = similarity của user * artist score
          const contributionScore = user.similarity * (artist.score || 1);
          recommendations[artist.spotifyId].score += contributionScore;
          recommendations[artist.spotifyId].recommendedBy.push({
            userId: user.userId,
            similarity: user.similarity
          });
        }
      });
    });

    // Convert object to array và sort
    const sortedRecommendations = Object.values(recommendations)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(rec => ({
        ...rec,
        normalizedScore: Math.min(rec.score / 10, 1).toFixed(2), // Scale 0-1
        recommendedByCount: rec.recommendedBy.length
      }));

    console.log(`   ✓ Generated ${sortedRecommendations.length} artist recommendations`);

    return sortedRecommendations;
  }

  /**
   * PHẦN 6: LẤY GENRE RECOMMENDATIONS
   * Gợi ý genres từ similar users
   */
  getGenreRecommendations(similarUsers) {
    console.log('\n🎵 Lấy genre recommendations...');

    const knownGenres = new Set(
      this.currentUser.topGenres?.map(g => g.genre) || []
    );

    const genreScores = {};

    similarUsers.forEach(user => {
      user.topGenres?.forEach(genre => {
        if (!knownGenres.has(genre.genre)) {
          if (!genreScores[genre.genre]) {
            genreScores[genre.genre] = 0;
          }
          genreScores[genre.genre] += user.similarity * (genre.count || 1);
        }
      });
    });

    const sortedGenres = Object.entries(genreScores)
      .map(([genre, score]) => ({ genre, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(`   ✓ Generated ${sortedGenres.length} genre recommendations`);

    return sortedGenres;
  }

  /**
   * MAIN METHOD: Thực hiện toàn bộ collaborative filtering
   */
  analyze(options = {}) {
    console.log('\n' + '='.repeat(50));
    console.log('BẮT ĐẦU COLLABORATIVE FILTERING');
    console.log('='.repeat(50));

    const {
      minSimilarity = 0.15,
      maxUsers = 10
    } = options;

    // Bước 1: Tìm similar users
    const similarUsers = this.findSimilarUsers(minSimilarity, maxUsers);

    // Nếu không tìm thấy similar users
    if (similarUsers.length === 0) {
      console.log('\n⚠️  Không tìm thấy similar users');
      console.log('   → Sẽ dùng content-based filtering hoặc trending items');
      
      return {
        hasSimilarUsers: false,
        similarUsersCount: 0,
        artistRecommendations: [],
        genreRecommendations: [],
        message: 'Không đủ dữ liệu để collaborative filtering'
      };
    }

    // Bước 2: Lấy recommendations
    const artistRecommendations = this.getArtistRecommendations(similarUsers);
    const genreRecommendations = this.getGenreRecommendations(similarUsers);

    // Tính metrics
    const avgSimilarity = similarUsers.reduce((sum, u) => sum + u.similarity, 0) / similarUsers.length;

    const result = {
      hasSimilarUsers: true,
      similarUsersCount: similarUsers.length,
      averageSimilarity: avgSimilarity,
      topSimilarity: similarUsers[0]?.similarity || 0,
      
      artistRecommendations,
      genreRecommendations,
      
      // Debug info
      similarUsers: similarUsers.map(u => ({
        userId: u.userId,
        similarity: (u.similarity * 100).toFixed(1) + '%'
      }))
    };

    console.log('\n' + '='.repeat(50));
    console.log('✅ HOÀN THÀNH COLLABORATIVE FILTERING');
    console.log('='.repeat(50));
    console.log(`📊 Similar users: ${result.similarUsersCount}`);
    console.log(`📊 Artist recommendations: ${result.artistRecommendations.length}`);
    console.log(`📊 Genre recommendations: ${result.genreRecommendations.length}`);
    console.log('='.repeat(50) + '\n');

    return result;
  }

  /**
   * Helper: In summary của kết quả
   */
  printSummary(result) {
    console.log('\n📋 COLLABORATIVE FILTERING SUMMARY');
    console.log('─'.repeat(50));
    
    if (!result.hasSimilarUsers) {
      console.log('❌ No similar users found');
      return;
    }

    console.log(`✅ Found ${result.similarUsersCount} similar users`);
    console.log(`📊 Average similarity: ${(result.averageSimilarity * 100).toFixed(1)}%`);
    console.log(`\n🎤 Top Artist Recommendations:`);
    
    result.artistRecommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.name} (score: ${rec.normalizedScore})`);
    });

    console.log(`\n🎵 Top Genre Recommendations:`);
    result.genreRecommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.genre}`);
    });
    
    console.log('─'.repeat(50) + '\n');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Mock function: Generate fake users data để test
 */
function generateMockUsers(count = 5) {
  const mockGenres = ['k-pop', 'j-pop', 'pop', 'rock', 'hip-hop', 'edm'];
  const mockArtists = [
    { name: 'BTS', spotifyId: 'bts-id' },
    { name: 'BlackPink', spotifyId: 'bp-id' },
    { name: 'IU', spotifyId: 'iu-id' },
    { name: 'Twice', spotifyId: 'twice-id' },
    { name: 'NewJeans', spotifyId: 'nj-id' }
  ];

  return Array.from({ length: count }, (_, i) => ({
    userId: i + 1,
    topArtists: mockArtists
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(a => ({ ...a, score: Math.floor(Math.random() * 10) + 5 })),
    topGenres: mockGenres
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map(g => ({ genre: g, count: Math.floor(Math.random() * 20) + 10 }))
  }));
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CollaborativeFilter, generateMockUsers };
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
// Current user profile (từ UserAnalyzer)
const currentUserProfile = {
  topArtists: [
    { spotifyId: 'bts-id', name: 'BTS', score: 15 },
    { spotifyId: 'iu-id', name: 'IU', score: 12 }
  ],
  topGenres: [
    { genre: 'k-pop', count: 25 },
    { genre: 'pop', count: 15 }
  ]
};

// Other users data (từ database)
const allUsersData = [
  {
    userId: 2,
    topArtists: [
      { spotifyId: 'bts-id', name: 'BTS', score: 20 },
      { spotifyId: 'twice-id', name: 'Twice', score: 15 }
    ],
    topGenres: [
      { genre: 'k-pop', count: 30 }
    ]
  }
  // ... more users
];

// Tạo filter
const filter = new CollaborativeFilter(currentUserProfile, allUsersData);

// Analyze
const result = filter.analyze();

// Print summary
filter.printSummary(result);

// Hoặc dùng mock data để test
const mockUsers = generateMockUsers(10);
const filterTest = new CollaborativeFilter(currentUserProfile, mockUsers);
const testResult = filterTest.analyze();
*/