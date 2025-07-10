import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ filterText, setFilterText }) {
  return (
    <div className="relative w-72">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="border p-2 rounded-md shadow-sm w-full pl-10 bg-white"
      />
    </div>
  );
} 