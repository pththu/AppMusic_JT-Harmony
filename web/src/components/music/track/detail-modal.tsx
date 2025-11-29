import { Badge, Modal } from "@/components/ui"
import { Disc } from "lucide-react"

const DetailModal = ({
  isViewDialogOpen,
  setIsViewDialogOpen,
  selectedTrack,
  formatArtists,
}) => {
  return (
    <Modal
      isOpen={isViewDialogOpen}
      onClose={() => setIsViewDialogOpen(false)}
      title="Thông tin bài hát"
    >
      {selectedTrack && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <img src={selectedTrack.imageUrl} alt="Cover" className="w-32 h-32 ml-4 rounded-lg shadow-md object-cover border border-gray-100" />
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{selectedTrack.name}</h3>
              <p className="text-blue-600 font-medium">{formatArtists(selectedTrack.artists)}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Disc className="w-4 h-4" /> {selectedTrack.album.name}
              </p>
              <div className="flex gap-2 mt-2">
                {selectedTrack.explicit && <Badge variant="destructive" className="text-[10px] bg-black text-white">EXPLICIT</Badge>}
                <Badge variant="outline" className="text-[10px] border-gray-300">Track {selectedTrack.trackNumber}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Lượt Nghe</p>
              <p className="font-bold text-lg text-gray-800">{selectedTrack.playCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Chia sẻ</p>
              <p className="font-bold text-lg text-gray-800">{selectedTrack.shareCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Spotify ID</p>
              <p className="font-mono text-sm truncate text-gray-600" title={selectedTrack.spotifyId}>{selectedTrack.spotifyId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Video ID</p>
              <p className="font-mono text-sm text-gray-600">{selectedTrack.videoId || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default DetailModal;