import React from 'react';
import { useRouter } from 'next/router';

const LostJunkLeadsModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  // Redirect to the dedicated view instead of showing modal
  React.useEffect(() => {
    if (isOpen) {
      // This will be handled by the parent component to show the LostJunkLeadsView
      onClose();
    }
  }, [isOpen, onClose]);

  return null;
};

export default LostJunkLeadsModal;
