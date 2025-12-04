"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, subDays, subMonths, startOfYear, isAfter } from "date-fns";
import HeaderSection from "@/components/follow/header-section";
import OverView from "@/components/follow/over-view";
import SelectDetails from "@/components/follow/select-details";
import LeaderboardList from "@/components/follow/leaderboard-list";
import FollowersListModal from "@/components/follow/followers-list-modal";
import FollowerModal from "@/components/follow/follower-detail-modal";
import { useFollowStore, useMusicStore, useUserStore } from "@/store";

export default function FollowsStatsPage() {
  const [activeTab, setActiveTab] = useState<"artists" | "users">("artists");
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "6months" | "year">("30days");
  const [visibleCount, setVisibleCount] = useState(10); // Pagination limit

  // Modal State
  const [showAllFollowersModal, setShowAllFollowersModal] = useState(false);
  const followArtists = useFollowStore((state) => state.followArtists);
  const [selectedFollowerDetail, setSelectedFollowerDetail] = useState(null);
  const followUsers = useFollowStore((state) => state.followUsers);
  const users = useUserStore((state) => state.users);
  const artists = useMusicStore((state) => state.artists);
  const setFollowArtists = useFollowStore((state) => state.setFollowArtists);
  const setFollowUsers = useFollowStore((state) => state.setFollowUsers);
  const fetchFollowArtists = useFollowStore((state) => state.fetchFollowArtists);
  const fetchFollowUsers = useFollowStore((state) => state.fetchFollowUsers);

  const getUserById = (id: number) => users.find((u) => u.id === id);
  const getArtistById = (id: number) => artists.find((a) => a.id === id);
  // --- LOGIC ---

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, timeFilter, activeTab]);

  // Handle Delete Follow
  const handleDeleteFollow = (recordId: number, type: "artist" | "user") => {
    if (confirm("Bạn có chắc chắn muốn xóa lượt theo dõi này không?")) {
      if (type === "artist") {
        const updatedFollows = followArtists.filter(f => f.id !== recordId);
        setFollowArtists(updatedFollows);
      } else {
        const updatedFollows = followUsers.filter(f => f.id !== recordId);
        setFollowUsers(updatedFollows);
      }
    }
  };

  // Filter Data by Time
  const filterByTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    switch (timeFilter) {
      case "7days": return isAfter(date, subDays(now, 7));
      case "30days": return isAfter(date, subDays(now, 30));
      case "6months": return isAfter(date, subMonths(now, 6));
      case "year": return isAfter(date, startOfYear(now));
      default: return true;
    }
  };

  // 1. Calculate Top Artists
  const topArtists = useMemo(() => {
    const filteredFollows = followArtists.filter(f => filterByTime(f.createdAt));
    const counts: Record<number, number> = {};

    filteredFollows.forEach((f) => {
      counts[f.artistId] = (counts[f.artistId] || 0) + 1;
    });

    let result = Object.entries(counts)
      .map(([artistId, count]) => {
        const artist = getArtistById(Number(artistId));
        return { ...artist, followerCount: count, rank: 0 };
      })
      .filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.followerCount - a.followerCount)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return result;
  }, [followArtists, timeFilter, searchQuery]);

  // 2. Calculate Top Users
  const topUsers = useMemo(() => {
    const filteredFollows = followUsers.filter(f => filterByTime(f.createdAt));
    const counts: Record<number, number> = {};

    filteredFollows.forEach((f) => {
      counts[f.followeeId] = (counts[f.followeeId] || 0) + 1;
    });

    let result = Object.entries(counts)
      .map(([userId, count]) => {
        const user = getUserById(Number(userId));
        return { ...user, followerCount: count, rank: 0 };
      })
      .filter(item => item.status === 'active')
      .filter(item =>
        item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.followerCount - a.followerCount)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return result;
  }, [followUsers, timeFilter, searchQuery]);

  // 3. Stats
  const totalArtistFollows = followArtists.length;
  const totalUserFollows = followUsers.length;
  const mostPopularArtist = topArtists[0];
  const mostPopularUser = topUsers[0];

  // Get Followers for Selected Item
  const getFollowersOfSelected = (limit?: number) => {
    if (!selectedItem) return [];
    let list = [];

    if (activeTab === "artists") {
      list = followArtists
        .filter(f => f.artistId === selectedItem.id)
        .map(f => ({ ...f, follower: getUserById(f.followerId) }));
    } else {
      list = followUsers
        .filter(f => f.followeeId === selectedItem.id)
        .map(f => ({ ...f, follower: getUserById(f.followerId) }));
    }

    // Sort by newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return limit ? list.slice(0, limit) : list;
  };

  const followersList = getFollowersOfSelected(); // Full list for modal
  const followersPreview = getFollowersOfSelected(10); // Preview list for sidebar

  useEffect(() => {
    fetchFollowArtists();
    fetchFollowUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 font-sans text-gray-900">

      {/* HEADER SECTION */}
      <HeaderSection timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

      {/* OVERVIEW CARDS */}
      <OverView
        totalArtistFollows={totalArtistFollows}
        totalUserFollows={totalUserFollows}
        mostPopularArtist={mostPopularArtist}
        mostPopularUser={mostPopularUser}
        timeFilter={timeFilter}
      />

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: LEADERBOARD LIST */}
        <LeaderboardList
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          topArtists={topArtists}
          topUsers={topUsers}
          visibleCount={visibleCount}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          setVisibleCount={setVisibleCount}
        />

        {/* RIGHT COLUMN: SELECTED DETAILS */}
        <SelectDetails
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          activeTab={activeTab}
          timeFilter={timeFilter}
          followersPreview={followersPreview}
          setShowAllFollowersModal={setShowAllFollowersModal}
          setSelectedFollowerDetail={setSelectedFollowerDetail}
          format={format}
        />
      </div>

      {/* --- MODALS --- */}
      {/* 1. Modal Xem Tất Cả Followers */}
      <FollowersListModal
        showAllFollowersModal={showAllFollowersModal}
        setShowAllFollowersModal={setShowAllFollowersModal}
        selectedItem={selectedItem}
        followersList={followersList}
        setSelectedFollowerDetail={setSelectedFollowerDetail}
        handleDeleteFollow={handleDeleteFollow}
        activeTab={activeTab}
        format={format}
      />

      {/* 2. Modal Chi Tiết Người Dùng */}
      <FollowerModal
        selectedFollowerDetail={selectedFollowerDetail}
        setSelectedFollowerDetail={setSelectedFollowerDetail}
        format={format}
      />
    </div>
  );
}