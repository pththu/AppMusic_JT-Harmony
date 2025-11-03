import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import React, { useState, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';
import { albumData } from '@/constants/data';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { AddTrackToPlaylist, AddTrackToPlaylistAfterConfirm } from '@/services/musicService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_TRACKS_GROUPS = [
  {
    title: "Mới phát gần đây",
    data: [
      {
        "spotifyId": "5YMXGBD6vcYP7IolemyLtK",
        "videoId": "5BdSZkY6F4M",
        "name": "Euphoria",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/5YMXGBD6vcYP7IolemyLtK",
        "duration": 228615,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 1,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "4YDHRtzm0OGuieCTVQjVuk",
        "videoId": "IiW1kEJDBDQ",
        "name": "Trivia 起 : Just Dance",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/4YDHRtzm0OGuieCTVQjVuk",
        "duration": 225220,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 2,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "1dS4l6xmdgEhCZTAhdOm4N",
        "videoId": "ejR5zKaPZ0g",
        "name": "Serendipity (Full Length Edition)",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/1dS4l6xmdgEhCZTAhdOm4N",
        "duration": 276707,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 3,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "2ngmiq1KoYn3x25VOmvd8F",
        "videoId": "Rx6D5FN1pvg",
        "name": "DNA",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/2ngmiq1KoYn3x25VOmvd8F",
        "duration": 223122,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 4,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "1rLkzFZdokhx6Wcs80uvnw",
        "videoId": "dMtGmUfyBXw",
        "name": "Dimple",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/1rLkzFZdokhx6Wcs80uvnw",
        "duration": 196776,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 5,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "6bSwpQYEguyMlkCoWiBt3Y",
        "videoId": "6lMo517PIzk",
        "name": "Trivia 承 : Love",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/6bSwpQYEguyMlkCoWiBt3Y",
        "duration": 225697,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 6,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "6FHVHycPPTQp6aAHjLhzFT",
        "videoId": "RCSc6cbdyMs",
        "name": "Her",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/6FHVHycPPTQp6aAHjLhzFT",
        "duration": 228612,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 7,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "2ApfJvLr7RbhJl6NOVhEu6",
        "videoId": "Xn1L9pvk6sE",
        "name": "Singularity",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/2ApfJvLr7RbhJl6NOVhEu6",
        "duration": 196998,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 8,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "6a0gRYXKK0YU69cXaB2RrK",
        "videoId": "i4JGSpVBEJU",
        "name": "FAKE LOVE",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/6a0gRYXKK0YU69cXaB2RrK",
        "duration": 242333,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 9,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "4eP8Syl3aBEQw3Jy5Bhq0D",
        "videoId": "tK4oNOE4V6s",
        "name": "The Truth Untold",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/4eP8Syl3aBEQw3Jy5Bhq0D",
        "duration": 242292,
        "artists": [
          "BTS",
          "Steve Aoki"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 1,
        "trackNumber": 10,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
    ],
    subtitle: null,
  },
  {
    title: "Bài hát bạn đã thích",
    data: [
      {
        "spotifyId": "3xYfDSxJhRLDIb1fw71WTw",
        "videoId": "VMqDSntAbC0",
        "name": "Best Of Me",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/3xYfDSxJhRLDIb1fw71WTw",
        "duration": 227191,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 2,
        "trackNumber": 2,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "60nwvOMLA1uzLHz3CLp4Na",
        "videoId": "4DCOsbO27oY",
        "name": "Airplane pt.2",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/60nwvOMLA1uzLHz3CLp4Na",
        "duration": 218614,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 2,
        "trackNumber": 3,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "4kZoZfj7IBg8eo1JZ2vsGO",
        "videoId": "AEm5O3VnKi8",
        "name": "Go Go",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/4kZoZfj7IBg8eo1JZ2vsGO",
        "duration": 235779,
        "artists": [
          "BTS"
        ],
        "album": "Love Yourself 結 'Answer'",
        "discNumber": 2,
        "trackNumber": 4,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "2wU8wd47r8e8BqAa0QBlTW",
        "videoId": "wANmnZIzkq0",
        "name": "Vô Vi - Chill Mix",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/2wU8wd47r8e8BqAa0QBlTW",
        "duration": 240000,
        "artists": [
          "Vũ Cát Tường"
        ],
        "album": "Vi Nhất (Chill Mix)",
        "discNumber": 1,
        "trackNumber": 1,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "5TA0pfOtzeYDWtZlZ3JwcN",
        "videoId": "0CjFN2LuqAc",
        "name": "Vô Cực - Chill Mix",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/5TA0pfOtzeYDWtZlZ3JwcN",
        "duration": 252500,
        "artists": [
          "Vũ Cát Tường"
        ],
        "album": "Vi Nhất (Chill Mix)",
        "discNumber": 1,
        "trackNumber": 2,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "0gZjxVfCcwIDpZWkxhHDkV",
        "videoId": "P69q6rJ5Rc4",
        "name": "Hư Vô - Chill Mix",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/0gZjxVfCcwIDpZWkxhHDkV",
        "duration": 238285,
        "artists": [
          "Vũ Cát Tường"
        ],
        "album": "Vi Nhất (Chill Mix)",
        "discNumber": 1,
        "trackNumber": 3,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
    ],
    subtitle: null,
  },
  {
    title: "Được đề xuất",
    data: [
      {
        "spotifyId": "5M3fWhjSIANCZfl5uAdY3A",
        "videoId": "UnmNLec-8d4",
        "name": "Từng Là",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/5M3fWhjSIANCZfl5uAdY3A",
        "duration": 250956,
        "artists": [
          "Orinn"
        ],
        "album": "Marcus, Ballad Collection #1",
        "discNumber": 1,
        "trackNumber": 1,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "2S1pHznRe2XPdVB2RVYpvs",
        "videoId": "Ll5kj_v-U3o",
        "name": "Nằm Bên Anh",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/2S1pHznRe2XPdVB2RVYpvs",
        "duration": 203555,
        "artists": [
          "Orinn",
          "Marcus"
        ],
        "album": "Marcus, Ballad Collection #1",
        "discNumber": 1,
        "trackNumber": 2,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "2K0Zj8EtfaKOT5Iah3UYZz",
        "videoId": "EczcMTOhL8Q",
        "name": "Dấu Mưa",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/2K0Zj8EtfaKOT5Iah3UYZz",
        "duration": 269085,
        "artists": [
          "Orinn"
        ],
        "album": "Marcus, Ballad Collection #1",
        "discNumber": 1,
        "trackNumber": 3,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "7JK6k99GF8xsqOWCqac13J",
        "videoId": "TNEiSp5Pdb0",
        "name": "Chiều Nay Không Có Mưa Bay",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/7JK6k99GF8xsqOWCqac13J",
        "duration": 290232,
        "artists": [
          "Orinn"
        ],
        "album": "Marcus, Ballad Collection #1",
        "discNumber": 1,
        "trackNumber": 4,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "6asLy1FD53zlruTdXYBVmy",
        "videoId": "6eergTCejUk",
        "name": "Chờ Anh Nhé",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/6asLy1FD53zlruTdXYBVmy",
        "duration": 322682,
        "artists": [
          "Orinn"
        ],
        "album": "Marcus, Ballad Collection #1",
        "discNumber": 1,
        "trackNumber": 5,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
      {
        "spotifyId": "0XRKzz1xYOMVFvVvSy5HDp",
        "videoId": "oppgxM2rzPs",
        "name": "Bắt Đầu Đỏ Mặt, Kết Thúc Đỏ Mắt",
        "lyrics": "",
        "externalUrl": "https://open.spotify.com/track/0XRKzz1xYOMVFvVvSy5HDp",
        "duration": 271818,
        "artists": [
          "Orinn",
          "Marcus"
        ],
        "album": "Marcus, Ballad Collection #1",
        "discNumber": 1,
        "trackNumber": 6,
        "type": "track",
        "explicit": false,
        "playCount": 0,
        "shareCount": 0
      },
    ],
    subtitle: "Dựa trên các bài hát bạn vừa thêm vào.",
  },
];

const TrackItem = React.memo(({ item, isDarkMode, onAdd }: { item: any; isDarkMode: boolean; onAdd: (track: any) => void; }) => {
  const textColor = isDarkMode ? "text-white" : "text-black";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-600";
  const primaryColor = "#22c55e";

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center flex-1 pr-4">
        <Image
          source={{ uri: item.imageUrl || albumData.filter(album => album.name === item.album)[0]?.imageUrl || 'https://via.placeholder.com/150' }}
          className="w-12 h-12 rounded-sm mr-3"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className={`text-base ${textColor}`} numberOfLines={1}>
            {item.name}
          </Text>
          <Text className={`text-sm ${subTextColor}`} numberOfLines={1}>
            {item.artists.join(', ')}
          </Text>
        </View>
      </View>

      {/* Nút Thêm (+) */}
      <TouchableOpacity
        onPress={() => onAdd(item)}
        className="w-10 h-10 justify-center items-center rounded-full"
      >
        <Icon name="add-circle-outline" size={28} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );
});

const AddTrackScreen = ({ playlistName = "Playlist của tôi" }) => {

  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const colorScheme = useColorScheme();
  const { success, error, confirm, info } = useCustomAlert();
  const isDarkMode = colorScheme === 'dark';
  const bgColor = isDarkMode ? '#121212' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const iconColor = isDarkMode ? 'white' : 'black';
  const inputBgColor = isDarkMode ? '#333' : 'rgb(229, 231, 235)';
  const [mockData, setMockData] = useState(MOCK_TRACKS_GROUPS);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef(null);

  const handleAddTrack = async (track) => {
    console.log(`Đã thêm bài hát: ${track.name}`);
    console.log(track)
    try {
      const payload = {
        playlistId: currentPlaylist?.id,
        trackId: track?.id || null,
        trackSpotifyId: track?.spotifyId,
      }

      const response = await AddTrackToPlaylist(payload);
      if (response.success) {
        setMockData(prevData => {
          return prevData.map(group => {
            return {
              ...group,
              data: group.data.filter(t => t.spotifyId !== track.spotifyId)
            };
          });
        });
        success('Thành công', 'Đã thêm bài hát vào danh sách phát.');
      } else {
        if (response.isExisting) {
          confirm(
            'Bài hát đã tồn tại',
            response.message,
            async () => {
              const confirmResponse = await AddTrackToPlaylistAfterConfirm(payload);
              if (confirmResponse.success) {
                setMockData(prevData => {
                  return prevData.map(group => {
                    return {
                      ...group,
                      data: group.data.filter(t => t.spotifyId !== track.spotifyId)
                    };
                  });
                });
                success('Thành công', 'Đã thêm bài hát vào danh sách phát.');
              } else {
                error('Lỗi', 'Không thể thêm bài hát vào danh sách phát.');
              }
            },
            () => { }
          )
        }
      }
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể thêm bài hát vào danh sách phát.');
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(newIndex);
  };

  const isSearching = searchQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const lowerCaseQuery = searchQuery.toLowerCase();
    const allTracks = MOCK_TRACKS_GROUPS.flatMap(group => group.data);

    return allTracks.filter(track =>
      track.name.toLowerCase().includes(lowerCaseQuery) ||
      track.artists.some(artist => artist.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchQuery]);


  const renderSlide = ({ item, index }) => (
    <View style={{ width: SCREEN_WIDTH }} className="px-4">
      <Text className={`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
        {item.title}
      </Text>
      {item.subtitle && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          {item.subtitle}
        </Text>
      )}

      <FlatList
        data={item.data}
        keyExtractor={(track, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: trackItem }) => (
          <TrackItem item={trackItem} isDarkMode={isDarkMode} onAdd={handleAddTrack} />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );

  const renderSearchMode = () => (
    <FlatList
      data={searchResults}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      className="px-4"
      renderItem={({ item }) => (
        <TrackItem item={item} isDarkMode={isDarkMode} onAdd={handleAddTrack} />
      )}
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">
            Không tìm thấy bài hát.
          </Text>
        </View>
      )}
      ListFooterComponent={<View style={{ height: 100 }} />}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="flex-1">
        <View className="flex-row items-center pt-2 pb-4 px-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Icon name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className={`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Thêm vào danh sách phát này</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>
              Vào: {currentPlaylist?.name || playlistName}
            </Text>
          </View>
        </View>

        {/* Thanh Tìm kiếm */}
        <View className="px-4 pb-4">
          <View className={`flex-row items-center rounded-lg p-2`} style={{ backgroundColor: inputBgColor }}>
            <Icon name="search" size={20} color="#888" />
            <TextInput
              placeholder="Tìm kiếm"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`ml-2 flex-1 text-base ${textColor}`}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="ml-2 p-1">
                <Icon name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- Phần chính: Slider (Nếu không tìm kiếm) hoặc Kết quả tìm kiếm --- */}
        {isSearching ? (
          renderSearchMode()
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={mockData}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled // chế độ trượt theo trang
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={renderSlide}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH}
            />

            {/* Chấm chỉ báo (Pagination Dots) */}
            <View className="flex-row justify-center py-3 absolute bottom-20 w-full">
              {MOCK_TRACKS_GROUPS?.map((_, index) => (
                <View
                  key={index}
                  className="w-2 h-2 rounded-full mx-1"
                  style={{
                    backgroundColor: activeIndex === index ? iconColor : 'gray',
                    opacity: activeIndex === index ? 1 : 0.5,
                  }}
                />
              ))}
            </View>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}

export default AddTrackScreen;