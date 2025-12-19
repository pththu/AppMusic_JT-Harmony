import { useNavigate } from '@/hooks/useNavigate';
import { SaveSearchHistory, SearchUsers } from '@/services/searchService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  topOffset: number;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ visible, onClose, topOffset }) => {
  const { navigate } = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]); // Store search queries
  const [showHistory, setShowHistory] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const { height } = Dimensions.get('window');
  const statusBarHeight = StatusBar.currentHeight || 44; // Safe area for status bar

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Load search history from AsyncStorage
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.log('Error loading search history:', error);
    }
  };

  // Save search query to history
  const saveToHistory = async (query: string) => {
    try {
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
      
      // Also save to server
      await SaveSearchHistory(query);
    } catch (error) {
      console.log('Error saving search history:', error);
    }
  };

  // Animation khi mở/đóng modal
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Debounced search
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (query.trim().length === 0) {
        setSearchResults([]);
        setShowHistory(true);
        return;
      }
      
      setIsSearching(true);
      
      try {
        const response = await SearchUsers({ 
          username: query,
          fullName: query,
          limit: 10
        });
        
        if (response.success && response.data) {
          const mappedResults: User[] = response.data.map((user: any) => ({
            id: user.id?.toString() || user._id?.toString(),
            name: user.fullName || user.name || 'Unknown',
            username: user.username || 'unknown',
            avatarUrl: user.avatarUrl || user.profilePicture
          }));
          
          setSearchResults(mappedResults);
          setShowHistory(false);
          
          if (mappedResults.length > 0) {
            saveToHistory(query);
          }
        } else {
          setSearchResults([]);
          setShowHistory(false);
        }
      } catch (error) {
        console.log('SearchUsers error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Search khi query thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch]);

  // Navigate đến profile
  const handleUserPress = (user: User) => {
    navigate('ProfileSocialScreen', { userId: user.id });
    handleClose();
  };

  // Đóng overlay
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowHistory(true);
    onClose();
  };

  // Handle history item press
  const handleHistoryPress = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Clear search history
  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('search_history');
    } catch (error) {
      console.log('Error clearing search history:', error);
    }
  };

  // Render history item
  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleHistoryPress(item)}
      className="flex-row items-center p-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800"
    >
      <Icon name="clock" size={16} color="#9ca3af" style={{ marginRight: 12 }} />
      <Text className="flex-1 text-black dark:text-white text-sm">
        {item}
      </Text>
      <TouchableOpacity onPress={() => handleHistoryPress(item)}>
        <Icon name="arrow-up-left" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render search result item
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item)}
      className="flex-row items-center p-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800"
    >
      <Image
        source={{ uri: item.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1762574889/kltn/user_hnoh3o.png' }}
        className="w-10 h-10 rounded-full mr-3"
      />
      <View className="flex-1">
        <Text className="text-black dark:text-white font-semibold text-sm">
          {item.name}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs">
          @{item.username}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-emerald-600 dark:text-emerald-400 text-xs mr-1">
          Xem
        </Text>
        <Icon name="chevron-right" size={14} color="#10b981" />
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-8">
      <Icon name="search" size={32} color="#9ca3af" />
      <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center text-sm">
        {searchQuery.trim() === '' 
          ? 'Nhập tên người dùng để tìm kiếm'
          : 'Không tìm thấy người dùng nào'
        }
      </Text>
      {searchQuery.trim() !== '' && (
        <Text className="text-gray-400 dark:text-gray-500 mt-1 text-xs">
          Thử tìm kiếm với từ khóa khác
        </Text>
      )}
    </View>
  );

  // Render history section
  const renderHistorySection = () => {
    if (!showHistory || searchHistory.length === 0) {
      return renderEmptyState();
    }

    return (
      <View>
        {searchHistory.length > 0 && (
          <View className="flex-row justify-between items-center px-3 py-2">
            <Text className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
              Gần đây
            </Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text className="text-red-500 text-xs">
                Xóa tất cả
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          data={searchHistory}
          keyExtractor={(item, index) => `history-${index}`}
          renderItem={renderHistoryItem}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  };

  return (
    <Animated.View
      className={`absolute left-0 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-b-2xl z-50 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        top: topOffset + statusBarHeight,
        maxHeight: height * 0.6,
        transform: [{ translateY: visible ? 0 : -20 }],
      }}
    >
      {/* Search bar */}
      <View className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={onClose} className="mr-2">
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Icon name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-black dark:text-white text-sm"
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search results */}
      {visible && (
        <View className="max-h-80">
          {isSearching ? (
            <View className="flex-1 justify-center items-center py-6">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2 text-xs">
                Đang tìm kiếm...
              </Text>
            </View>
          ) : showHistory && searchQuery.trim() === '' ? (
            renderHistorySection()
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

export default SearchOverlay;
