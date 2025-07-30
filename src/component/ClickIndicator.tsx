import React from 'react';

interface ClickIndicatorProps {
  clickedElement: string | null;
}

export const ClickIndicator: React.FC<ClickIndicatorProps> = ({ clickedElement }) => {
  if (!clickedElement) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-20">
      {clickedElement}
    </div>
  );
};
