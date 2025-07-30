import React from 'react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute top-4 left-4 flex gap-2 z-10">
      <button
        onClick={onZoomIn}
        className="bg-white hover:bg-gray-100 border border-gray-300 rounded px-3 py-1 font-bold shadow-sm"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="bg-white hover:bg-gray-100 border border-gray-300 rounded px-3 py-1 font-bold shadow-sm"
      >
        −
      </button>
      <button
        onClick={onReset}
        className="bg-white hover:bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
      >
        Reset
      </button>
    </div>
  );
};