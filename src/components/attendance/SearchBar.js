import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ searchInput, setSearchInput, placeholder = "Search employees...", width = "w-64" }) => {
  return (
    <div className={`relative ${width}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
    </div>
  );
};

export default SearchBar; 