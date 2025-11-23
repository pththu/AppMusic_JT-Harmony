import { useCallback, useEffect, useState } from "react";
import { useCustomAlert } from "./useCustomAlert";
import { useNavigate } from "./useNavigate";
import { GetUserProfileSocial } from "@/services/followService";
import { fetchPostsByUserId } from "@/services/socialApi";
import { fetchCoversByUserId } from "@/services/coverService";
import { useFollowStore } from "@/store/followStore";
import { set } from "date-fns";

export const useProfileSocialData = (userId) => {

  const { goBack } = useNavigate();
  const { success, error, info, confirm } = useCustomAlert();

  const isFollowing = useFollowStore((state) => state.isFollowing);
  const userFollowees = useFollowStore((state) => state.userFollowees);
  const setIsFollowing = useFollowStore((state) => state.setIsFollowing);

  const [isRefreshing, setIsRefreshing] = useState(false); // Trạng thái refresh
  const [loading, setLoading] = useState(true); // Loading chính
  const [profile, setProfile] = useState(null); // Thông tin profile
  const [posts, setPosts] = useState([]); // Danh sách bài đăng
  const [covers, setCovers] = useState([]); // Danh sách covers

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      error("Lỗi", "Không tìm thấy ID người dùng.");
      goBack();
      return;
    }
    try {
      const profileResponse = await GetUserProfileSocial(userId);
      console.log(profileResponse)
      if (!profileResponse.success) {
        error("Lỗi", profileResponse.message || "Không thể tải thông tin profile.");
      }

      setProfile(profileResponse.data);
    } catch (err) {
      error("Lỗi", "Không thể tải thông tin profile. Vui lòng thử lại." + err.message);
    }
  }, [userId]);

  const fetchPosts = useCallback(async (userId) => {
    try {
      const postResponse = await fetchPostsByUserId(userId);
      if ("message" in postResponse) {
        throw new Error(String(postResponse.message));
      }
      const allPosts = postResponse;
      const postsOnly = allPosts.filter((post) => !post.isCover);
      setPosts(postsOnly);
    } catch (err) {
      error("Lỗi", "Không thể tải bài đăng. Vui lòng thử lại." + err.message);
    }
  }, [userId]);

  const fetchCovers = useCallback(async (userId) => {
    try {
      const coversResponse = await fetchCoversByUserId(userId);
      setCovers(coversResponse);
    } catch (err) {
      error("Lỗi", "Không thể tải covers. Vui lòng thử lại." + err.message);
    }
  }, [userId]);

  const checkIsFollowing = useCallback(() => {
    if (!userId) {
      setIsFollowing(false);
      return;
    }
    for (const followedUser of userFollowees) {
      if (followedUser.id === userId) {
        setIsFollowing(true);
        return;
      }
    }
    setIsFollowing(false);
  }, [userId, userFollowees, setIsFollowing]);

  useEffect(() => {
    fetchProfile(userId);
    fetchPosts(userId);
    fetchCovers(userId);
    checkIsFollowing();
    setLoading(false);
  }, [userId, checkIsFollowing, fetchProfile, fetchPosts, fetchCovers]);

  useEffect(() => {
    checkIsFollowing();
  }, [userFollowees, checkIsFollowing]);

  return {
    profile,
    posts,
    covers,
    loading,
    isFollowing,
    isRefreshing,
    setIsRefreshing,
    setIsFollowing,
    setLoading,
    setProfile,
    setPosts,
    setCovers,
  }
}