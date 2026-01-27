import { useEffect, useRef } from "react";

export default function SearchInput({ value, onChange, placeholder }) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      className="border px-3 py-2 rounded w-full mb-3"
    />
  );
}
