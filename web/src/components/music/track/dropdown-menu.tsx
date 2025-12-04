import { useEffect, useRef, useState } from "react";

const DropdownMenu = ({ trigger, items }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-block">{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-md z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          {items.map((item: any, idx: number) => (
            <button
              key={idx}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${item.className || 'text-gray-700'}`}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;