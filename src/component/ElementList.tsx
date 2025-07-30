import React from 'react';
import { SVGElementData } from '../types';

interface ElementListProps {
  svgElements: SVGElementData[];
}

export const ElementList: React.FC<ElementListProps> = ({ svgElements }) => {
  if (svgElements.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded shadow-lg p-4 max-w-xs max-h-40 overflow-y-auto z-10">
      <h3 className="font-bold text-sm mb-2">SVG Elements ({svgElements.length})</h3>
      <div className="space-y-1">
        {svgElements.map((element) => (
          <div key={element.id} className="text-xs">
            <span className="font-mono text-blue-600">{element.id}</span>: {element.title}
          </div>
        ))}
      </div>
    </div>
  );
};