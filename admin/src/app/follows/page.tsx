"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  UserPlus,
  Music,
  Users,
} from "lucide-react";
import {
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  mockFollowArtists,
  mockFollowUsers,
  mockUsers,
  mockArtists,
  getUserById,
  type FollowArtist,
  type FollowUser,
} from "@/lib/mock-data";

export default function FollowsPage() {
  const [followArtists, setFollowArtists] =
    useState<FollowArtist[]>(mockFollowArtists);
  const [followUsers, setFollowUsers] = useState<FollowUser[]>(mockFollowUsers);
  const [selectedFollow, setSelectedFollow] = useState<
    FollowArtist | FollowUser | null
  >(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [followType, setFollowType] = useState<"artist" | "user">("artist");

  const handleDeleteFollowArtist = (followId: number) => {
    setFollowArtists(followArtists.filter((follow) => follow.id !== followId));
  };

  const handleDeleteFollowUser = (followId: number) => {
    setFollowUsers(followUsers.filter((follow) => follow.id !== followId));
  };

  const handleViewFollow = (
    follow: FollowArtist | FollowUser,
    type: "artist" | "user"
  ) => {
    setSelectedFollow(follow);
    setFollowType(type);
    setIsViewDialogOpen(true);
  };

  const getArtistById = (id: number) => {
    return mockArtists.find((artist) => artist.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Theo Dõi</h1>
          <p className="text-gray-600">
            Quản lý các mối quan hệ theo dõi (nghệ sĩ và người dùng)
          </p>
        </div>
      </div>

      <Tabs defaultValue="artists" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="artists">Theo Dõi Nghệ Sĩ</TabsTrigger>
          <TabsTrigger value="users">Theo Dõi Người Dùng</TabsTrigger>
        </TabsList>

        <TabsContent value="artists" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người Theo Dõi</TableHead>
                  <TableHead>Nghệ Sĩ</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead className="w-[70px]">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followArtists.map((follow) => {
                  const follower = getUserById(follow.followerId);
                  const artist = getArtistById(follow.artistId);

                  return (
                    <TableRow key={follow.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {follower?.avatarUrl ? (
                              <img
                                src={follower.avatarUrl}
                                alt={follower.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Users className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {follower?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {follower?.fullName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            {artist?.imageUrl ? (
                              <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Music className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {artist?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Spotify ID: {artist?.spotifyId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(follow.followedAt),
                          "MMM dd, yyyy 'lúc' HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewFollow(follow, "artist")}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem Chi Tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteFollowArtist(follow.id)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa Theo Dõi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người Theo Dõi</TableHead>
                  <TableHead>Được Theo Dõi</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead className="w-[70px]">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUsers.map((follow) => {
                  const follower = getUserById(follow.followerId);
                  const followee = getUserById(follow.followeeId);

                  return (
                    <TableRow key={follow.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {follower?.avatarUrl ? (
                              <img
                                src={follower.avatarUrl}
                                alt={follower.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Users className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {follower?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {follower?.fullName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {followee?.avatarUrl ? (
                              <img
                                src={followee.avatarUrl}
                                alt={followee.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Users className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {followee?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {followee?.fullName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(follow.followedAt),
                          "MMM dd, yyyy 'lúc' HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewFollow(follow, "user")}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem Chi Tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteFollowUser(follow.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa Theo Dõi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Follow Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Mối Quan Hệ Theo Dõi</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết về mối quan hệ theo dõi
            </DialogDescription>
          </DialogHeader>
          {selectedFollow && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <UserPlus className="h-6 w-6 text-green-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {followType === "artist"
                        ? "Theo Dõi Nghệ Sĩ"
                        : "Theo Dõi Người Dùng"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(selectedFollow.followedAt),
                        "MMM dd, yyyy 'lúc' HH:mm"
                      )}
                    </p>
                  </div>
                </div>

                {/* Follower Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Người Theo Dõi
                  </h4>
                  {(() => {
                    const follower = getUserById(selectedFollow.followerId);
                    return follower ? (
                      <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {follower.avatarUrl ? (
                            <img
                              src={follower.avatarUrl}
                              alt={follower.username}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <Users className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {follower.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {follower.fullName}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {follower.id}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không tìm thấy thông tin người theo dõi
                      </p>
                    );
                  })()}
                </div>

                {/* Followee Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {followType === "artist"
                      ? "Nghệ Sĩ Được Theo Dõi"
                      : "Người Dùng Được Theo Dõi"}
                  </h4>
                  {followType === "artist"
                    ? (() => {
                        const artist = getArtistById(
                          (selectedFollow as FollowArtist).artistId
                        );
                        return artist ? (
                          <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              {artist.imageUrl ? (
                                <img
                                  src={artist.imageUrl}
                                  alt={artist.name}
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                <Music className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {artist.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Spotify ID: {artist.spotifyId}
                              </p>
                              <p className="text-xs text-gray-400">
                                ID: {artist.id}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Không tìm thấy thông tin nghệ sĩ
                          </p>
                        );
                      })()
                    : (() => {
                        const followee = getUserById(
                          (selectedFollow as FollowUser).followeeId
                        );
                        return followee ? (
                          <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {followee.avatarUrl ? (
                                <img
                                  src={followee.avatarUrl}
                                  alt={followee.username}
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                <Users className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {followee.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {followee.fullName}
                              </p>
                              <p className="text-xs text-gray-400">
                                ID: {followee.id}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Không tìm thấy thông tin người dùng
                          </p>
                        );
                      })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
