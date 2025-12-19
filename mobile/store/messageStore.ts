import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MessageState {
  currentConversation: any | null;
  receiver: any | null;
  lastMessage: any | null;
  messages: any[];

  setMessages: (messages: any[]) => void;
  addMessage: (message: any) => void;
  updateMessage: (messageId: string, updatedFields: Partial<any>) => void;
  deleteMessage: (messageId: string) => void;

  setCurrentConversation: (conversation: any | null) => void;
  setReceiver: (receiver: any | null) => void;
  setLastMessage: (message: any | null) => void;
  clearStore: () => void;
}

const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      currentConversation: null,
      receiver: null,
      lastMessage: null,
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      updateMessage: (messageId, updatedFields) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updatedFields } : msg
          ),
        })),
      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        })),
      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
      setReceiver: (receiver) => set({ receiver }),
      setLastMessage: (message) => set({ lastMessage: message }),
      clearStore: () =>
        set({
          currentConversation: null,
          receiver: null,
          lastMessage: null,
          messages: [],
        }),
    }),
    {
      name: 'message-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log(" Message store rehydrated"); // gọi khi load từ AsyncStorage xong
      }
    }
  )
);

export const messageStore = useMessageStore;
export default useMessageStore;