import React, { useState, useRef, useEffect } from "react";
import DropdownArrowIcon from "@/components/DropdownArrowIcon";

const ProfessionalInfo = ({ label,sublabel,id, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
const inputGroupClass = "mb-4";
const floatingLabelClass = "block text-sm font-medium text-gray-700 mb-1";
const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2";

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <span className="text-gray-700">{typeof value === 'object' ? value.name : value}</span>
            ) : (
              <span className="text-gray-500">{sublabel}</span>
            )}
          </div>
          <DropdownArrowIcon isOpen={isOpen} />

        </div>

        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
            {options.map((option) => (
              <div
                key={option.id}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                value?.[id] === option?.[id] ? "bg-blue-50" : ""
         }`}

                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span className="text-gray-700">{option.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfessionalInfo;