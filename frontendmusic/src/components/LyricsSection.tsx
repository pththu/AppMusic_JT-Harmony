import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const fullLyrics = [
  { text: 'Bend your chest open so I can reach your heart', time: 0 },
  { text: "I need to get inside, or I'll start a war", time: 5 },
  { text: 'Wanna look at the pieces that make you who you are', time: 9 },
  { text: 'I wanna build you up and pick you apart', time: 13 },
  { text: 'Let me see the dark sides as well as the bright', time: 17 },
  { text: "I'm gonna love you inside out", time: 22 },
  { text: "I'm gonna love you inside out", time: 26 },
  { text: 'Let me see the dark sides as well as the bright', time: 30 },
  { text: "I'm gonna love you inside out", time: 34 },
  { text: "I'm gonna love you inside out", time: 38 },
  { text: "I'm gonna love you", time: 42 },
  { text: "I'm gonna love you", time: 46 },
  { text: "I'm gonna love you", time: 50 },
  { text: "I'm gonna pick your brain and get to know your thoughts", time: 54 },
  { text: "So I can read your mind when you don't wanna talk", time: 58 },
  { text: 'And can I touch your face before you go?', time: 62 },
  { text: "I collect your scales but you don't have to know", time: 66 },
  { text: 'Let me see the dark sides as well as the bright', time: 70 },
  { text: "I'm gonna love you inside out", time: 74 },
  { text: "I'm gonna love you inside out", time: 78 },
  { text: 'Let me see the dark sides as well as the bright', time: 82 },
  { text: "I'm gonna love you inside out", time: 86 },
  { text: "I'm gonna love you inside out", time: 90 },
  { text: "I'm gonna love you", time: 94 },
  { text: "I'm gonna love you", time: 98 },
  { text: "I'm gonna love you inside out", time: 102 },
  { text: '(Your love, inside out)', time: 106 },
  { text: "I'm gonna love you inside out", time: 110 },
  { text: "I'm gonna love you inside out", time: 114 },
  { text: 'Inside out', time: 118 },
  { text: '(Your love, inside out)', time: 122 },
  { text: "I'm gonna love, I'm gonna love you inside out", time: 126 },
  { text: "I'm gonna love you", time: 130 },
  { text: "I'm gonna love you", time: 134 },
  { text: "I'm gonna love you", time: 138 },
];
const LyricsSection = () => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = currentLineIndex + 1;
      if (nextIndex < fullLyrics.length) {
        setCurrentLineIndex(nextIndex);
      } else {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentLineIndex]);

  // Cuộn đến dòng hiện tại
  useEffect(() => {
    if (scrollViewRef.current && !showFullLyrics) {
      // Ước tính chiều cao của một dòng lời bài hát
      const lineHeight = 60;
      // Vị trí cuộn cần đến để căn giữa màn hình
      const scrollToY =
        currentLineIndex * lineHeight - Dimensions.get('window').height * 0.2;

      scrollViewRef.current.scrollTo({
        y: scrollToY > 0 ? scrollToY : 0,
        animated: true,
      });
    }
  }, [currentLineIndex, showFullLyrics]);

  const handleShowLyrics = () => {
    setShowFullLyrics(!showFullLyrics);
  };

  const listHeight = showFullLyrics
    ? Dimensions.get('window').height * 0.7
    : 200;

  return (
    <View className="bg-[#1C1A2F] rounded-xl p-4 mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-lg font-bold">Lyrics</Text>
        <TouchableOpacity onPress={handleShowLyrics}>
          <Text className="text-gray-400 text-sm">
            {showFullLyrics ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: listHeight, overflow: 'hidden' }}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {fullLyrics.map((item, index) => {
            const isCurrent = index === currentLineIndex;
            return (
              <Text
                key={index}
                className={`text-center my-3 ${isCurrent ? 'text-white font-bold text-2xl' : 'text-gray-400 text-lg'}`}
              >
                {item.text}
              </Text>
            );
          })}
        </ScrollView>
      </View>
      <Text className="text-right text-gray-500 text-xs mt-2">Line Synced</Text>
    </View>
  );
};

export default LyricsSection;
