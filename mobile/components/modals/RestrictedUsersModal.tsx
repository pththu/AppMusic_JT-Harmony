import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

interface RestrictedUsersModalProps {
    isVisible: boolean;
    onClose: () => void;
    restrictedUsersList: any[];
    colorScheme: 'light' | 'dark' | null;
    onAddBackToList: (user: any) => void;
}

export default function RestrictedUsersModal({
    isVisible,
    onClose,
    restrictedUsersList,
    colorScheme,
    onAddBackToList,
}: RestrictedUsersModalProps) {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Header modal */}
                <View className={`flex-row items-center justify-between p-4 border-b ${
                    colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <TouchableOpacity
                        onPress={onClose}
                        className="p-2"
                    >
                        <Icon name="x" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <Text className={`text-xl font-bold ${
                        colorScheme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                        Danh sách hạn chế
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Danh sách restricted users */}
                {restrictedUsersList.length === 0 ? (
                    <View className="flex-1 justify-center items-center p-8">
                        <Icon name="user-x" size={64} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
                        <Text className={`text-lg font-semibold mt-4 ${
                            colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Chưa có người dùng nào trong danh sách hạn chế
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={restrictedUsersList}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onAddBackToList(item)}
                                className={`flex-row items-center px-4 py-3 border-b ${
                                    colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                }`}
                            >
                                <Image
                                    source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }}
                                    className="w-12 h-12 rounded-full mr-4 bg-gray-300"
                                />
                                <View className="flex-1">
                                    <Text className={`text-lg font-bold ${
                                        colorScheme === 'dark' ? 'text-white' : 'text-black'
                                    }`}>
                                        {item.fullName}
                                    </Text>
                                    <Text className={`text-sm ${
                                        colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        @{item.username}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => onAddBackToList(item)}
                                    className="p-2"
                                >
                                    <Icon name="plus" size={20} color="#10B981" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}
