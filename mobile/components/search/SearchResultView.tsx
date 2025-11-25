import { FlatList, Text, View } from "react-native";
import TabButton from "../button/TabButton";
import SearchResultItem from "../items/SearchResultItem";

const SearchResultsView = ({
  searchQuery,
  searchFilter,
  filteredSearchResults = [],
  setSearchFilter,
  primaryIconColor,
  colorScheme,
  onSelectSearchResult = (item: any) => { },
  onOpenOptionsModal = (item: any) => { },
}) => (
  <>
    <View className="flex-row mb-4">
      <TabButton
        title="Tất cả"
        tabName="all"
        onPress={() => setSearchFilter('all')}
        isActive={searchFilter === 'all'}
      />
      <TabButton
        title="Playlist"
        tabName="playlist"
        onPress={() => setSearchFilter('playlist')}
        isActive={searchFilter === 'playlist'}
      />
      <TabButton
        title="Album"
        tabName="album"
        onPress={() => setSearchFilter('album')}
        isActive={searchFilter === 'album'}
      />
    </View>

    <Text className={`mb-4 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
      Tìm thấy {filteredSearchResults.length} kết quả
    </Text>

    {/* Danh sách kết quả tìm kiếm */}
    {filteredSearchResults.length > 0 ? (
      <FlatList
        data={filteredSearchResults}
        keyExtractor={(item, index) => `${item.resultType}-${item.id || item.spotifyId}-${index}`}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <SearchResultItem
            item={item}
            index={index}
            onPress={() => onSelectSearchResult(item)}
            onPressOptions={() => onOpenOptionsModal(item)}
            primaryIconColor={primaryIconColor}
            colorScheme={colorScheme}
          />
        )}
      />
    ) : (
      <View className="flex-1 justify-center items-center">
        <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Không tìm thấy kết quả cho "{searchQuery}"
        </Text>
      </View>
    )}
  </>
);

export default SearchResultsView;