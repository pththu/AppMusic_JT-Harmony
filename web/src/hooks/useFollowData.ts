import { useCallback, useEffect, useState } from "react"
import { useUserData } from "./useUserData";
import { GetAllArtist, GetAllFollowArtist, GetAllFollowUser } from "@/services/followApi";
import { useMusicStore } from "@/store/musicStore";

export const useFollowData = () => {
  const { artists, fetchArtists, setArtists } = useMusicStore();
  const [followUsers, setFollowUsers] = useState([]);
  const [followArtists, setFollowArtists] = useState([]);

  const { users, setUsers } = useUserData();

  const fetchFollowUsers = useCallback(async () => {
    try {
      const response = await GetAllFollowUser();
      if (response.success) {
        setFollowUsers(response.data);
      } else {
        setFollowUsers([]);
      }
    } catch (error) {
      console.log('error fetch all follow users', error);
    }
  }, []);

  const fetchFollowArtists = useCallback(async () => {
    try {
      const response = await GetAllFollowArtist();
      if (response.success) {
        setFollowArtists(response.data);
      } else {
        setFollowArtists([]);
      }
    } catch (error) {
      console.log('error fetch all follow artists', error);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
    fetchFollowUsers();
    fetchFollowArtists();
  }, [])

  return {
    users,
    artists,
    followUsers,
    followArtists,

    setUsers,
    setArtists,
    setFollowUsers,
    setFollowArtists,
  }
}