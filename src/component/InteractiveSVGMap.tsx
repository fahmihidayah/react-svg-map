'use client';
import { useSVGProcessor } from '@/hooks/useSVGProcessor';
import { useZoom } from '@/hooks/useZoom';
import { HoverLabelState, SVGElementData, TooltipState } from '@/types';
import React, { useState, useRef } from 'react';
import { ClickIndicator } from './ClickIndicator';
import { UploadControls } from './UploadControls';
import { Tooltip } from './Tooltip';
import { ZoomControls } from './ZoomControls';
import { ElementList } from './ElementList';
import { HoverLabel } from './HoverLabel';

const InteractiveSVGMap: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({ 
    visible: false, text: '', x: 0, y: 0 
  });
  
  const [hoverLabel, setHoverLabel] = useState<HoverLabelState>({ 
    visible: false, text: '', x: 0, y: 0 
  });
  
  const [clickedElement, setClickedElement] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { zoom, zoomIn, zoomOut, resetZoom, handleWheelZoom } = useZoom();
  const { svgContent, svgElements, isLoading, handleFileUpload } = useSVGProcessor();

  const handleMouseEnter = (elementData: SVGElementData): void => {
    setTooltip(prev => ({ ...prev, visible: true, text: elementData.title }));
    
    if (elementData.type === 'rect' && elementData.x !== undefined && elementData.width !== undefined) {
      const labelX = elementData.x + (elementData.width / 2);
      const labelY = elementData.y! - 10;
      setHoverLabel({
        visible: true,
        text: elementData.title,
        x: labelX,
        y: labelY
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      setTooltip(prev => ({ ...prev, x: x + 10, y: y + 10 }));
    }
  };

  const handleMouseLeave = (): void => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setHoverLabel(prev => ({ ...prev, visible: false }));
  };

  const handleElementClick = (elementData: SVGElementData): void => {
    setClickedElement(`Clicked on ${elementData.title}`);
    setTimeout(() => setClickedElement(null), 3000);
  };

  const handleWheel = (e: React.WheelEvent): void => {
    e.preventDefault();
    handleWheelZoom(e.deltaY);
  };

  const handleSVGElementMouseEnter = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement;
    const elementData = svgElements.find(el => el.id === target.id);
    if (elementData) handleMouseEnter(elementData);
  };

  const handleSVGElementClick = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement;
    const elementData = svgElements.find(el => el.id === target.id);
    if (elementData) handleElementClick(elementData);
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-gray-100 overflow-hidden">
      <ClickIndicator clickedElement={clickedElement} />
      <UploadControls isLoading={isLoading} onFileUpload={handleFileUpload} />
      <Tooltip tooltip={tooltip} />
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
      <ElementList svgElements={svgElements} />

      <div className="w-full h-full flex items-center justify-center">
        {svgContent ? (
          <div className="relative">
            <div
              className="max-w-full max-h-full cursor-pointer"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.1s ease-out'
              }}
              onWheel={handleWheel}
              dangerouslySetInnerHTML={{ __html: svgContent }}
              onMouseEnter={handleSVGElementMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleSVGElementClick}
            />
            <HoverLabel hoverLabel={hoverLabel} zoom={zoom} />
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-semibold">No SVG uploaded</p>
            <p className="text-sm">Click "Upload SVG" to get started</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-element {
          cursor: pointer;
          transition: opacity 0.2s ease, filter 0.2s ease;
        }
        .hover-element:hover {
          opacity: 0.8;
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default InteractiveSVGMap;