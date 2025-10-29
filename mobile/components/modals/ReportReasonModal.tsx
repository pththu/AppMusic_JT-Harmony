import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Định nghĩa lý do (Bạn có thể đặt trong một file constants nếu cần)
const REPORT_REASONS = [
    { id: 'adult_content', title: 'Nội dung người lớn', icon: 'zap' },
    { id: 'self_harm', title: 'Tự hại bản thân', icon: 'frown' },
    { id: 'misinformation', title: 'Thông tin sai sự thật/lừa đảo', icon: 'alert-triangle' },
    { id: 'unwanted_content', title: 'Tôi không muốn thấy nội dung này', icon: 'slash' },
];
type ReportReasonId = typeof REPORT_REASONS[number]['id'];

interface ReportReasonModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number | null;
  // Hàm xử lý gửi báo cáo cuối cùng
  onFinalReport: (postId: number, reason: ReportReasonId) => void; 
}

const ReportReasonModal: React.FC<ReportReasonModalProps> = ({
  visible,
  onClose,
  postId,
  onFinalReport,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedReason, setSelectedReason] = useState<ReportReasonId | null>(null);

  const baseTextColor = isDark ? 'text-white' : 'text-black';
  const separatorColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const handleSendReport = () => {
    if (postId && selectedReason) {
      onFinalReport(postId, selectedReason);
      onClose();
    }
  };

  const renderItem = ({ item }: { item: typeof REPORT_REASONS[number] }) => {
    const isSelected = item.id === selectedReason;
    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between p-4 border-b ${separatorColor} ${
          isSelected ? 'bg-indigo-500/10 dark:bg-indigo-900/30' : ''
        }`}
        onPress={() => setSelectedReason(item.id)}
      >
        <View className="flex-row items-center flex-1">
          <Icon name={item.icon} size={20} color={isSelected ? '#4f46e5' : (isDark ? '#d1d5db' : '#4b5563')} />
          <Text className={`ml-3 text-base ${baseTextColor} ${isSelected ? 'font-semibold text-indigo-500' : ''}`}>
            {item.title}
          </Text>
        </View>
        {isSelected && (
          <Icon name="check-circle" size={20} color="#4f46e5" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="w-full bg-white dark:bg-[#1f2937] rounded-t-2xl shadow-2xl p-4">
          
          {/* Thanh kéo (Handle) và Tiêu đề */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
            <Text className={`text-xl font-bold text-center ${baseTextColor}`}>
              Báo cáo bài viết
            </Text>
            <Text className={`text-sm text-center mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Vui lòng chọn một lý do để gửi báo cáo.
            </Text>
          </View>
          
          {/* Danh sách Lý do */}
          <FlatList
            data={REPORT_REASONS}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            className="max-h-80 my-4" // Giới hạn chiều cao cho list
            showsVerticalScrollIndicator={false}
          />
          
          {/* Nút Gửi/Hủy */}
          <View className="flex-row justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              className="flex-1 py-3 mr-2 rounded-xl bg-gray-100 dark:bg-gray-800"
              onPress={onClose}
            >
              <Text className={`text-base font-bold text-center ${baseTextColor}`}>
                Hủy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 py-3 ml-2 rounded-xl ${
                selectedReason ? 'bg-red-500' : 'bg-gray-400'
              }`}
              onPress={handleSendReport}
              disabled={!selectedReason}
            >
              <Text className="text-base font-bold text-center text-white">
                Gửi Báo Cáo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportReasonModal;