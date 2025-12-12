import { Badge, Modal } from "@/components/ui"
import { useUserStore } from "@/store"
import { Music } from "lucide-react"

const ViewDetailModal = ({
  isViewDialogOpen,
  setIsViewDialogOpen,
  selectedPlaylist,
}) => {

  const { users } = useUserStore()

  return (
    <Modal
      isOpen={isViewDialogOpen}
      onClose={() => setIsViewDialogOpen(false)}
      title="Thông tin chi tiết"
    >
      {selectedPlaylist && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              {selectedPlaylist.imageUrl ?
                <img src={selectedPlaylist.imageUrl} className="w-full h-full object-cover rounded-lg" />
                : <Music className="w-8 h-8 text-gray-400" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">{selectedPlaylist.name}</h3>
              <p className="text-sm text-gray-500">{selectedPlaylist?.userId ? users.find(u => u.id === selectedPlaylist.userId)?.fullName : 'Unknown'}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{selectedPlaylist.type}</Badge>
                <Badge variant={selectedPlaylist.isPublic ? "outline" : "secondary"}>{selectedPlaylist.isPublic ? "Public" : "Private"}</Badge>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded border border-gray-100 text-sm">
            <p><strong>Database ID:</strong> {selectedPlaylist.id}</p>
            <p><strong>Spotify ID:</strong> {selectedPlaylist.spotifyId || 'N/A'}</p>
            <p><strong>Số bài hát:</strong> {selectedPlaylist.totalTracks}</p>
            <p><strong>Mô tả:</strong> {selectedPlaylist.description || "Không có"}</p>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ViewDetailModal