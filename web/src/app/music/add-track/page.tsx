"use client";

import React, { useEffect, useState } from "react";
import {
  Music,
  Disc,
  User,
  Plus,
  X,
  ArrowLeft,
  Save,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { useMusicStore } from "@/store";
import { useRouter } from "next/navigation";

// --- MOCK UI COMPONENTS (Để file hoạt động độc lập) ---
const Button = ({ children, variant = "primary", size = "md", className = "", ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "hover:bg-gray-100 text-gray-600",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizes: any = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
    placeholder:text-gray-400 focus:outline-none focus:ring-2 
    focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const Label = ({ children, className = "" }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
);

const Textarea = ({ className = "", ...props }: any) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props || 'Khoong có thông tin'} />
);

const Switch = ({ checked, onCheckedChange }: any) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const formatDuration = (ms: number) => {
  if (!ms) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
};

export default function CreateTrackPage() {

  const router = useRouter();
  const { tracks, artists, albums, fetchTracks, fetchAlbums, fetchArtists } = useMusicStore();

  const [formData, setFormData] = useState({
    // Track Model
    spotifyId: "",
    videoId: "",
    name: "",
    lyrics: "",
    externalUrl: "",
    duration: 0, // In ms
    discNumber: 1,
    trackNumber: 1,
    explicit: false,
    releaseDate: "",
    album: {
      name: "",
      spotifyId: "",
      imageUrl: "",
      releaseDate: "",
      totalTracks: 1
    },
    artists: [
      { name: "", spotifyId: "", imageUrl: "", totalFollowers: 0 }
    ]
  });

  const [activeTab, setActiveTab] = useState<"track" | "album" | "artist">("track");

  // Handlers
  const handleTrackChange = (field: string, value: any) => {
    if (field === 'spotifyId') {
      const matchedTrack = tracks.find(t => t.spotifyId === value);
      if (matchedTrack) {
        setFormData(prev => ({ ...prev, ...matchedTrack }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAlbumChange = (field: string, value: any) => {
    if (field === 'spotifyId') {
      const matchedAlbum = albums.find(a => a.spotifyId === value);
      if (matchedAlbum) {
        setFormData(prev => ({ ...prev, album: matchedAlbum }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, album: { ...prev.album, [field]: value } }));
  };

  const handleArtistChange = (index: number, field: string, value: any) => {
    if (field === 'spotifyId') {
      const matchedArtist = artists.find(a => a.spotifyId === value);
      if (matchedArtist) {
        const newArtists = [...formData.artists];
        newArtists[index] = { ...newArtists[index], ...matchedArtist };
        setFormData(prev => ({ ...prev, artists: newArtists }));
        return;
      }
    }

    const newArtists = [...formData.artists];
    newArtists[index] = { ...newArtists[index], [field]: value };
    setFormData(prev => ({ ...prev, artists: newArtists }));
  };

  const addArtist = () => {
    setFormData(prev => ({
      ...prev,
      artists: [...prev.artists, { name: "", spotifyId: "", imageUrl: "", totalFollowers: 0 }]
    }));
  };

  const removeArtist = (index: number) => {
    if (formData.artists.length > 1) {
      setFormData(prev => ({
        ...prev,
        artists: prev.artists.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate basic
    if (!formData.name || !formData.spotifyId) {
      alert("Vui lòng nhập tên bài hát và Spotify ID");
      return;
    }
    console.log(formData);
  };

  const handleCancel = () => {
    setFormData({
      spotifyId: "",
      videoId: "",
      name: "",
      lyrics: "",
      externalUrl: "",
      duration: 0,
      discNumber: 1,
      trackNumber: 1,
      explicit: false,
      releaseDate: "",
      album: {
        name: "",
        spotifyId: "",
        imageUrl: "",
        releaseDate: "",
        totalTracks: 1
      },
      artists: [
        { name: "", spotifyId: "", imageUrl: "", totalFollowers: 0 }
      ]
    });
  }

  useEffect(() => {
    if (albums.length === 0) fetchAlbums();
    if (artists.length === 0) fetchArtists();
    if (tracks.length === 0) fetchTracks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-start gap-3">
              <button type="button"
                onClick={() => router.back()}
                className="inline-flex items-start text-black hover:text-gray-900">
                <ArrowLeft className="h-7 w-7 mr-1 font-bold" />
              </button>
              <div>

                <h2 className="text-2xl font-bold text-gray-900">Thêm bài hát mới</h2>
                <p className="text-sm text-gray-500">Nhập thông tin bài hát, album và nghệ sĩ trình bày.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>Hủy bỏ</Button>
              <Button type="submit" variant="primary">
                <Save className="h-4 w-4 mr-2" /> Lưu Bài Hát
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation for Form */}
            <div className="lg:col-span-1 space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("track")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'track' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Music className="h-4 w-4" /> Thông tin bài hát
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("album")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'album' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Disc className="h-4 w-4" /> Thông tin Album
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("artist")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'artist' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="h-4 w-4" /> Thông tin Nghệ sĩ
              </button>
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3 space-y-6">

              {/* TRACK INFO SECTION */}
              {activeTab === 'track' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Music className="h-5 w-5 text-blue-600" /> Chi tiết Track
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>Tên bài hát <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Ví dụ: Blinding Lights"
                        value={formData.name}
                        onChange={(e: any) => handleTrackChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>Spotify ID <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Nhập ID từ Spotify"
                        value={formData.spotifyId}
                        onChange={(e: any) => handleTrackChange("spotifyId", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Video ID (Youtube)</Label>
                      <Input
                        placeholder="Optional"
                        value={formData.videoId}
                        onChange={(e: any) => handleTrackChange("videoId", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>External URL</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">http://</span>
                        <Input
                          className="rounded-l-none"
                          placeholder="link-to-song.com"
                          value={formData.externalUrl}
                          onChange={(e: any) => handleTrackChange("externalUrl", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Thời lượng (ms)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 200000"
                        value={formData.duration}
                        onChange={(e: any) => handleTrackChange("duration", parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 text-right">Preview: {formatDuration(formData.duration)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Ngày phát hành</Label>
                      <Input
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e: any) => handleTrackChange("releaseDate", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Disc Number</Label>
                        <Input
                          type="number"
                          value={formData.discNumber}
                          onChange={(e: any) => handleTrackChange("discNumber", parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Track Number</Label>
                        <Input
                          type="number"
                          value={formData.trackNumber}
                          onChange={(e: any) => handleTrackChange("trackNumber", parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <Label className="text-base">Explicit Content (18+)</Label>
                        <p className="text-xs text-gray-500">Bài hát có chứa nội dung nhạy cảm không?</p>
                      </div>
                      <Switch
                        checked={formData.explicit}
                        onCheckedChange={(val: boolean) => handleTrackChange("explicit", val)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lời bài hát (Lyrics)</Label>
                      <Textarea
                        placeholder="Nhập lời bài hát tại đây..."
                        className="min-h-[150px] font-mono text-xs"
                        value={formData.lyrics}
                        onChange={(e: any) => handleTrackChange("lyrics", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ALBUM INFO SECTION */}
              {activeTab === 'album' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Disc className="h-5 w-5 text-purple-600" /> Chi tiết Album
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6 flex items-start gap-3">
                    <div className="mt-0.5 text-blue-600"><FileText className="h-4 w-4" /></div>
                    <p className="text-sm text-blue-800">
                      Bạn đang tạo mới một Track. Dưới đây là thông tin Album chứa Track này.
                      Nếu Album đã tồn tại, hệ thống sẽ tự động liên kết dựa trên <b>Spotify ID</b>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Tên Album</Label>
                      <Input
                        placeholder="Ví dụ: After Hours"
                        value={formData.album.name}
                        onChange={(e: any) => handleAlbumChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Album Spotify ID</Label>
                      <Input
                        placeholder="ID Album"
                        value={formData.album.spotifyId}
                        onChange={(e: any) => handleAlbumChange("spotifyId", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ngày phát hành Album</Label>
                      <Input
                        type="date"
                        value={formData.album.releaseDate}
                        onChange={(e: any) => handleAlbumChange("releaseDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Album Artwork URL</Label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Input
                            placeholder="https://..."
                            value={formData.album.imageUrl}
                            onChange={(e: any) => handleAlbumChange("imageUrl", e.target.value)}
                          />
                        </div>
                        <div className="h-10 w-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                          {formData.album.imageUrl ? <img src={formData.album.imageUrl} alt="Art" className="w-full h-full object-cover" /> : <ImageIcon className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tổng số bài trong Album</Label>
                      <Input
                        type="number"
                        value={formData.album.totalTracks}
                        onChange={(e: any) => handleAlbumChange("totalTracks", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ARTIST INFO SECTION */}
              {activeTab === 'artist' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" /> Danh sách Nghệ sĩ
                    </h3>
                    <Button type="button" size="sm" variant="outline" onClick={addArtist}>
                      <Plus className="h-3 w-3 mr-1" /> Thêm Nghệ Sĩ
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.artists.map((artist, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 relative group">
                        {formData.artists.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArtist(index)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Nghệ sĩ {index + 1} {index === 0 && "(Chính)"}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Tên Nghệ sĩ</Label>
                            <Input
                              value={artist.name}
                              onChange={(e: any) => handleArtistChange(index, "name", e.target.value)}
                              className="h-9"
                              placeholder="e.g. The Weeknd"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Spotify ID</Label>
                            {/* <Input
                              value={artist.spotifyId}
                              onChange={(e: any) => handleArtistChange(index, "spotifyId", e.target.value)}
                              className="h-9"
                            /> */}
                            <input className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50`}
                              value={artist.spotifyId}
                              onChange={(e: any) => handleArtistChange(index, "spotifyId", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs">Ảnh đại diện URL</Label>
                            <Input
                              value={artist.imageUrl}
                              onChange={(e: any) => handleArtistChange(index, "imageUrl", e.target.value)}
                              className="h-9"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}