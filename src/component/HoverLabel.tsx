import React from 'react';
import { HoverLabelState } from '../types';

interface HoverLabelProps {
  hoverLabel: HoverLabelState;
  zoom: number;
}

export const HoverLabel: React.FC<HoverLabelProps> = ({ hoverLabel, zoom }) => {
  if (!hoverLabel.visible) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${hoverLabel.x * zoom}px`,
        top: `${hoverLabel.y * zoom}px`,
        transform: `translate(-50%, -100%) scale(${1/zoom})`,
        transformOrigin: 'center bottom'
      }}
    >
      <div className="bg-yellow-400 text-black px-2 py-1 rounded text-sm font-bold shadow-lg">
        {hoverLabel.text}
      </div>
    </div>
  );
};