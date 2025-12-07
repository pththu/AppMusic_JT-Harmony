import { GetAllComments, GetAllPosts } from "@/services";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PostState {
  posts: any[];
  comments: any[];
  likes: any[];

  setPosts: (posts: any[]) => void;
  setComments: (comments: any[]) => void;
  setLikes: (likes: any[]) => void;

  fetchPosts: () => Promise<void>;
  fetchComments: () => Promise<void>;
  fetchLikes: () => Promise<void>;

  clearPosts: () => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: [],
      comments: [],
      likes: [],

      setPosts: (posts) => set({ posts }),
      setComments: (comments) => set({ comments }),
      setLikes: (likes) => set({ likes }),

      fetchPosts: async () => {
        try {
          const response = await GetAllPosts();
          if (response.success) {
            set({ posts: response.data });
          } else {
            set({ posts: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách bài đăng: ' + error.message);
        }
      },
      fetchComments: async () => {
        try {
          const response = await GetAllComments();
          if (response.success) {
            set({ comments: response.data });
          } else {
            set({ comments: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách bình luận: ' + error.message);
        }
      },
      fetchLikes: async () => { },
      clearPosts: () => set({
        posts: [],
        comments: [],
        likes: [],
      }),
    }),
    {
      name: "post-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("Post store rehydrated");
      }
    }
  )
)