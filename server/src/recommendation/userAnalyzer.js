/**
 * ============================================
 * USER ANALYZER MODULE
 * ============================================
 * Phân tích dữ liệu người dùng để tạo profile chi tiết
 * 
 * Input: Raw data từ database
 * Output: Structured user profile
 */

class UserAnalyzer {
  constructor(userData) {
    // Validate input data
    if (!userData) {
      throw new Error('userData là bắt buộc');
    }

    this.listeningHistory = userData.itemListeningHistory || [];
    this.searchHistory = userData.itemSearchHistory || [];
    this.favorites = userData.favoritesItems || [];
    this.followedArtists = userData.artistFollowedItems || [];
    this.mood = userData.moodToday || [];

    console.log('📊 Khởi tạo UserAnalyzer với:');
    console.log(`   - ${this.listeningHistory.length} lịch sử nghe`);
    console.log(`   - ${this.searchHistory.length} lịch sử tìm kiếm`);
    console.log(`   - ${this.favorites.length} yêu thích`);
    console.log(`   - ${this.followedArtists.length} nghệ sĩ đã follow`);
  }

  /**
   * PHẦN 1: PHÂN TÍCH THỂ LOẠI ÂM NHẠC
   * Trích xuất và đánh giá thể loại từ nhiều nguồn
   */
  analyzeGenres() {
    console.log('\n🎵 Phân tích thể loại âm nhạc...');
    
    const genreScores = {};

    // 1. Từ nghệ sĩ đã follow (weight cao nhất = 10)
    this.followedArtists.forEach(item => {
      const artist = item.artist || {};
      const genres = artist.genres || [];
      
      genres.forEach(genre => {
        genreScores[genre] = (genreScores[genre] || 0) + 10;
      });
    });

    // 2. Từ lịch sử nghe artist (weight = 5)
    this.listeningHistory.forEach(item => {
      if (item.itemType === 'artist' && item.item?.genres) {
        item.item.genres.forEach(genre => {
          genreScores[genre] = (genreScores[genre] || 0) + 5;
        });
      }
    });

    // 3. Từ favorites (weight = 3)
    this.favorites.forEach(item => {
      if (item.itemType === 'artist' && item.item?.genres) {
        item.item.genres.forEach(genre => {
          genreScores[genre] = (genreScores[genre] || 0) + 3;
        });
      }
    });

    // Sắp xếp và lấy top 5
    const topGenres = Object.entries(genreScores)
      .map(([genre, score]) => ({ genre, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log('   ✓ Top genres:', topGenres.map(g => g.genre).join(', '));

    return topGenres;
  }

  /**
   * PHẦN 2: PHÂN TÍCH NGHỆ SĨ YÊU THÍCH
   * Tính điểm cho mỗi nghệ sĩ dựa trên nhiều yếu tố
   */
  analyzeArtists() {
    console.log('\n👨‍🎤 Phân tích nghệ sĩ yêu thích...');
    
    const artistScores = {};

    // Helper function: Thêm hoặc cập nhật artist
    const updateArtist = (spotifyId, name, imageUrl, scoreToAdd) => {
      if (!artistScores[spotifyId]) {
        artistScores[spotifyId] = {
          spotifyId,
          name,
          imageUrl,
          score: 0
        };
      }
      artistScores[spotifyId].score += scoreToAdd;
    };

    // 1. Nghệ sĩ đã follow (điểm cao nhất = 15)
    this.followedArtists.forEach(item => {
      const artist = item.artist || {};
      updateArtist(
        item.artistSpotifyId,
        artist.name,
        artist.imageUrl,
        15
      );
    });

    // 2. Từ lịch sử nghe tracks
    this.listeningHistory.forEach(item => {
      if (item.itemType === 'track' && item.item?.artists) {
        item.item.artists.forEach(artist => {
          const baseScore = (item.playCount || 1) * 2;
          const durationBonus = item.durationListened > 60000 ? 1 : 0;
          updateArtist(
            artist.spotifyId,
            artist.name,
            artist.imageUrl,
            baseScore + durationBonus
          );
        });
      }
    });

    // 3. Từ lịch sử nghe artist trực tiếp
    this.listeningHistory.forEach(item => {
      if (item.itemType === 'artist') {
        updateArtist(
          item.itemSpotifyId,
          item.item?.name,
          item.item?.imageUrl,
          5
        );
      }
    });

    // 4. Từ favorites
    this.favorites.forEach(item => {
      if (item.item?.artists) {
        item.item.artists.forEach(artist => {
          updateArtist(
            artist.spotifyId,
            artist.name,
            artist.imageUrl,
            8
          );
        });
      }
    });

    // Sắp xếp và lấy top 10
    const topArtists = Object.values(artistScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log('   ✓ Top artists:', topArtists.slice(0, 3).map(a => a.name).join(', '));

    return topArtists;
  }

  /**
   * PHẦN 3: PHÂN TÍCH TỪ KHÓA TÌM KIẾM
   * Lấy recent searches và phân tích xu hướng
   */
  analyzeSearchHistory() {
    console.log('\n🔍 Phân tích lịch sử tìm kiếm...');
    
    // Sắp xếp theo thời gian mới nhất
    const recentSearches = this.searchHistory
      .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
      .slice(0, 10)
      .map(item => ({
        query: item.query,
        searchedAt: item.searchedAt,
        daysSinceSearch: Math.floor(
          (Date.now() - new Date(item.searchedAt)) / (1000 * 60 * 60 * 24)
        )
      }));

    console.log('   ✓ Recent searches:', recentSearches.slice(0, 3).map(s => s.query).join(', '));

    return recentSearches;
  }

  /**
   * PHẦN 4: PHÂN TÍCH ĐẶC ĐIỂM ÂM NHẠC
   * Duration, explicit content, completion rate...
   */
  analyzeMusicFeatures() {
    console.log('\n🎼 Phân tích đặc điểm âm nhạc...');
    
    let totalDuration = 0;
    let explicitCount = 0;
    let totalTracks = 0;
    let completedListens = 0;
    let totalListenTime = 0;

    this.listeningHistory.forEach(item => {
      if (item.itemType === 'track' && item.item) {
        totalTracks++;
        
        const trackDuration = item.item.duration || 0;
        const listenedDuration = item.durationListened || 0;
        
        totalDuration += trackDuration;
        totalListenTime += listenedDuration;
        
        // Đếm explicit
        if (item.item.explicit) {
          explicitCount++;
        }
        
        // Tính completion rate (nghe hết >80% bài)
        const completionRate = trackDuration > 0 
          ? listenedDuration / trackDuration 
          : 0;
        
        if (completionRate > 0.8) {
          completedListens++;
        }
      }
    });

    const features = {
      averageDuration: totalTracks > 0 
        ? Math.round(totalDuration / totalTracks) 
        : 0,
      
      explicitPreference: totalTracks > 0 
        ? (explicitCount / totalTracks).toFixed(2) 
        : 0,
      
      completionRate: totalTracks > 0 
        ? (completedListens / totalTracks).toFixed(2) 
        : 0,
      
      totalListeningTime: totalListenTime,
      totalTracks: totalTracks
    };

    console.log('   ✓ Avg duration:', Math.round(features.averageDuration / 1000) + 's');
    console.log('   ✓ Completion rate:', (features.completionRate * 100).toFixed(0) + '%');

    return features;
  }

  /**
   * PHẦN 5: TÌM BÀI HÁT NGHE LẠI NHIỀU LẦN
   * Những bài user thích và nghe đi nghe lại
   */
  findRepeatedTracks() {
    console.log('\n🔁 Tìm bài hát nghe lại nhiều lần...');
    
    const repeatedTracks = this.listeningHistory
      .filter(item => item.itemType === 'track' && item.playCount > 2)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5)
      .map(item => ({
        spotifyId: item.itemSpotifyId,
        name: item.item?.name,
        artist: item.item?.artists?.[0]?.name,
        playCount: item.playCount,
        totalListenTime: item.durationListened
      }));

    console.log('   ✓ Found', repeatedTracks.length, 'repeated tracks');

    return repeatedTracks;
  }

  /**
   * PHẦN 6: PHÂN TÍCH HÀNH VI NGHE NHẠC
   * Active user? Curated listener? Explorer?
   */
  analyzeBehavior() {
    console.log('\n📊 Phân tích hành vi...');
    
    const hasRecentActivity = this.listeningHistory.some(item => {
      const daysDiff = (Date.now() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24);
      return daysDiff < 7;
    });

    const behavior = {
      // User có active không (>20 lịch sử nghe)
      isActiveListener: this.listeningHistory.length > 20,
      
      // Tỉ lệ favorite/listening (cao = curated listener)
      favoritesRatio: this.favorites.length / Math.max(this.listeningHistory.length, 1),
      
      // Có hoạt động gần đây không
      hasRecentActivity: hasRecentActivity,
      
      // Discovery score (tìm kiếm nhiều = explorer)
      discoveryScore: this.searchHistory.length / 10,
      
      // Repeat listener (nghe lại nhiều)
      repeatListenerScore: this.listeningHistory.filter(i => i.playCount > 2).length / 
                           Math.max(this.listeningHistory.length, 1)
    };

    console.log('   ✓ Active listener:', behavior.isActiveListener);
    console.log('   ✓ Has recent activity:', behavior.hasRecentActivity);

    return behavior;
  }

  /**
   * MAIN METHOD: Tạo profile hoàn chỉnh
   * Gọi tất cả các phương thức phân tích và tổng hợp
   */
  generateProfile() {
    console.log('\n' + '='.repeat(50));
    console.log('BẮT ĐẦU PHÂN TÍCH USER PROFILE');
    console.log('='.repeat(50));

    const profile = {
      // Dữ liệu phân tích
      topGenres: this.analyzeGenres(),
      topArtists: this.analyzeArtists(),
      recentSearches: this.analyzeSearchHistory(),
      musicFeatures: this.analyzeMusicFeatures(),
      repeatedTracks: this.findRepeatedTracks(),
      behavior: this.analyzeBehavior(),
      
      // Metadata
      currentMood: this.mood,
      totalFavorites: this.favorites.length,
      totalFollowedArtists: this.followedArtists.length,
      totalListeningHistory: this.listeningHistory.length,
      
      // Timestamp
      analyzedAt: new Date().toISOString()
    };

    console.log('\n' + '='.repeat(50));
    console.log('✅ HOÀN THÀNH PHÂN TÍCH');
    console.log('='.repeat(50) + '\n');

    return profile;
  }

  /**
   * Export profile sang format JSON đẹp
   */
  exportJSON() {
    return JSON.stringify(this.generateProfile(), null, 2);
  }

  /**
   * In summary ngắn gọn
   */
  printSummary() {
    const profile = this.generateProfile();
    
    console.log('\n📋 USER PROFILE SUMMARY');
    console.log('─'.repeat(50));
    console.log(`🎵 Top Genres: ${profile.topGenres.map(g => g.genre).join(', ')}`);
    console.log(`👨‍🎤 Top Artists: ${profile.topArtists.slice(0, 3).map(a => a.name).join(', ')}`);
    console.log(`😊 Current Mood: ${profile.currentMood.join(', ')}`);
    console.log(`🔁 Repeated Tracks: ${profile.repeatedTracks.length}`);
    console.log(`⭐ Favorites: ${profile.totalFavorites}`);
    console.log(`🎧 Listening History: ${profile.totalListeningHistory}`);
    console.log(`✅ Active Listener: ${profile.behavior.isActiveListener ? 'Yes' : 'No'}`);
    console.log('─'.repeat(50) + '\n');
  }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UserAnalyzer };
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
// Sample data (như trong file sample_data.js của bạn)
const userData = {
  itemListeningHistory: [...],
  itemSearchHistory: [...],
  favoritesItems: [...],
  artistFollowedItems: [...],
  moodToday: ["happy", "energetic"]
};

// Tạo analyzer
const analyzer = new UserAnalyzer(userData);

// Generate profile
const profile = analyzer.generateProfile();
console.log(profile);

// Hoặc in summary
analyzer.printSummary();

// Export JSON
const json = analyzer.exportJSON();
console.log(json);
*/