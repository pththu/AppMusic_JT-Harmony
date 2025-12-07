import { Badge, Modal } from "@/components/ui";

const ViewDetailModal = ({
  isViewDialogOpen,
  setIsViewDialogOpen,
  selectedArtist,
  formatNumber,
}) => {
  return (
    <Modal
      isOpen={isViewDialogOpen}
      onClose={() => setIsViewDialogOpen(false)}
      title="Thông tin nghệ sĩ"
    >
      {selectedArtist && (
        <div className="flex flex-col items-center text-center gap-6 pt-4 p-6">
          <div className="relative">
            <img
              src={selectedArtist.imageUrl || "https://placehold.co/150?text=No+Image"}
              alt="Avatar"
              className="w-32 h-32 rounded-full shadow-lg object-cover border-4 border-white ring-1 ring-gray-200"
            />
          </div>
          <div className="space-y-2 w-full">
            <h3 className="text-2xl font-bold text-gray-900">{selectedArtist.name}</h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {selectedArtist.genres?.map((g: string, i: number) => (
                <Badge key={i} variant="default">{g}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">Followers Thực</p>
              <p className="font-bold text-2xl text-gray-900 mt-1">{formatNumber(selectedArtist.calculatedFollowers)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-600 uppercase font-bold tracking-wide">Lượt Share</p>
              <p className="font-bold text-2xl text-gray-900 mt-1">{formatNumber(selectedArtist.shareCount || 0)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ViewDetailModal;