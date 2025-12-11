import { ArrowUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// --- COMPONENT TÌM KIẾM & CHỌN USER ---
const SearchableUserSelect = ({ users, value, onChange, placeholder = "Tìm người dùng..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Lấy user đang được chọn để hiển thị tên
  const selectedUser = users.find((u: any) => String(u.id) === String(value));

  // Lọc danh sách user dựa trên từ khóa tìm kiếm
  const filteredUsers = users.filter((user: any) =>
    (user.fullName || user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term về rỗng khi đóng để lần sau mở ra thấy list full
        // Hoặc có thể giữ nguyên tùy logic
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khi chọn 1 user
  const handleSelect = (userId: any, userName: string) => {
    onChange(userId);
    setSearchTerm(""); // Reset tìm kiếm
    setIsOpen(false); // Đóng menu
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Ô Input hiển thị giá trị hoặc để nhập tìm kiếm */}
      <div className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus-within:ring-1 focus-within:ring-blue-600 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          className="w-full bg-transparent focus:outline-none placeholder:text-gray-500"
          placeholder={selectedUser ? selectedUser.fullName : placeholder}
          value={isOpen ? searchTerm : (selectedUser?.fullName || "")}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          // Khi focus thì mở dropdown nhưng không xóa value ngay để user thấy
          onFocus={() => setIsOpen(true)}
        />
        <ArrowUpDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>

      {/* Danh sách thả xuống */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-[200px] w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-md animate-in fade-in zoom-in-95 duration-100">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user: any) => (
              <button
                key={user.id}
                className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-blue-50 hover:text-blue-600 ${String(user.id) === String(value) ? "bg-blue-50 text-blue-600 font-medium" : ""
                  }`}
                onClick={() => handleSelect(user.id, user.fullName)}
              >
                {/* Check icon nếu đang chọn */}
                <div className="mr-2 flex h-4 w-4 items-center justify-center">
                  {String(user.id) === String(value) && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <div className="flex flex-col">
                  <span>{user.fullName}</span>
                  <span className="text-xs text-gray-400">@{user.username || 'user'}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">
              Không tìm thấy người dùng.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableUserSelect;