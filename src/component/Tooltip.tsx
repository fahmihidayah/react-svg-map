
import React from 'react';
import { TooltipState } from '../types';

interface TooltipProps {
  tooltip: TooltipState;
}

export const Tooltip: React.FC<TooltipProps> = ({ tooltip }) => {
  if (!tooltip.visible) return null;

  return (
    <div
      className="absolute bg-black text-white px-2 py-1 rounded text-sm pointer-events-none z-10"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }}
    >
      {tooltip.text}
    </div>
  );
};