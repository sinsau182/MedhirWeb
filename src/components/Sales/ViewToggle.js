import React, { useState } from 'react';
import { FaThLarge, FaListUl, FaTrash } from 'react-icons/fa';
import LostJunkLeadsModal from './LostJunkLeadsModal';

export default function ViewToggle({ viewMode, setViewMode, onShowLostJunk }) {
  const [showLostJunkModal, setShowLostJunkModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const handleTrashClick = (e) => {
    e.stopPropagation();
    if (onShowLostJunk) {
      onShowLostJunk();
    } else {
      setModalPosition({ x: e.clientX, y: e.clientY });
      setShowLostJunkModal(true);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-md">
        <button
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'kanban'
              ? 'bg-blue-600 shadow text-white'
              : 'hover:bg-blue-100 text-blue-600'
          }`}
          onClick={() => setViewMode('kanban')}
          title="Kanban Board View"
        >
          <FaThLarge size={18} />
        </button>
        <button
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'table'
              ? 'bg-white shadow text-blue-600'
              : 'hover:bg-blue-100 text-blue-600'
          }`}
          onClick={() => setViewMode('table')}
          title="Table View"
        >
          <FaListUl size={18} />
        </button>
        <button
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'lost-junk'
              ? 'bg-red-200 shadow text-red-600'
              : 'hover:bg-red-100 text-gray-600 hover:text-red-600'
          }`}
          onClick={handleTrashClick}
          title="View Lost & Junk Leads"
        >
          <FaTrash size={18} />
        </button>
      </div>

      {/* Lost & Junk Leads Modal */}
      <LostJunkLeadsModal
        isOpen={showLostJunkModal}
        onClose={() => setShowLostJunkModal(false)}
        position={modalPosition}
      />
    </>
  );
} 