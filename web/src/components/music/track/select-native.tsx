const SelectNative = ({ value, onChange, options, placeholder = "Select...", className = "" }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    <option value="all">{placeholder}</option>
    {options.map((opt: any) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export default SelectNative;