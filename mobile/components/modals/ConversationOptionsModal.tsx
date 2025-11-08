import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ConversationOptionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    selectedUser: any;
    colorScheme: 'light' | 'dark' | null;
    onStartChat: (user: any) => void;
    onMoveToRestricted: (user: any) => void;
}

export default function ConversationOptionsModal({
    isVisible,
    onClose,
    selectedUser,
    colorScheme,
    onStartChat,
    onMoveToRestricted,
}: ConversationOptionsModalProps) {
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className={`w-80 p-6 rounded-lg ${
                    colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <Text className={`text-lg font-bold mb-4 ${
                        colorScheme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                        Tùy chọn cho {selectedUser?.fullName}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onStartChat(selectedUser)}
                        className="flex-row items-center py-3"
                    >
                        <Icon name="message-circle" size={20} color="#10B981" />
                        <Text className={`ml-3 text-base ${
                            colorScheme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                            Nhắn tin
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onMoveToRestricted(selectedUser)}
                        className="flex-row items-center py-3"
                    >
                        <Icon name="user-x" size={20} color="#EF4444" />
                        <Text className={`ml-3 text-base ${
                            colorScheme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                            Chuyển vào danh sách hạn chế
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-row items-center py-3"
                    >
                        <Icon name="x" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        <Text className={`ml-3 text-base ${
                            colorScheme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                            Hủy
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
