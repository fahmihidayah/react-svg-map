'use client';
import { useSVGProcessor } from '@/hooks/useSVGProcessor';
import { useZoom } from '@/hooks/useZoom';
import { HoverLabelState, SVGElementData, TooltipState } from '@/types';
import React, { useState, useRef, useCallback } from 'react';
import { ClickIndicator } from './ClickIndicator';
import { UploadControls } from './UploadControls';
import { Tooltip } from './Tooltip';
import { ZoomControls } from './ZoomControls';
import { ElementList } from './ElementList';
import { HoverLabel } from './HoverLabel';

interface PanState {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
  hasMoved: boolean;
}

const InteractiveSVGMap: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({ 
    visible: false, text: '', x: 0, y: 0 
  });
  
  const [hoverLabel, setHoverLabel] = useState<HoverLabelState>({ 
    visible: false, text: '', x: 0, y: 0 
  });
  
  const [clickedElement, setClickedElement] = useState<string | null>(null);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    hasMoved: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { zoom, zoomIn, zoomOut, resetZoom, handleWheelZoom } = useZoom();
  const { svgContent, svgElements, isLoading, handleFileUpload } = useSVGProcessor();

  const handleMouseEnter = (elementData: SVGElementData): void => {
    if (dragState.isDragging) return; // Don't show tooltip while dragging
    
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
    if (containerRef.current && !dragState.isDragging) {
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
    // Only process click if we haven't moved during the drag (i.e., it's a click, not a drag)
    if (dragState.hasMoved) return;
    
    const target = e.target as HTMLElement;
    const elementData = svgElements.find(el => el.id === target.id);
    if (elementData) handleElementClick(elementData);
  };

  // Pan functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      hasMoved: false
    });
  }, [pan.x, pan.y]);

  const handleMouseMoveGlobal = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Consider it a drag if mouse moved more than 3 pixels
    const isDrag = distance > 3;

    if (isDrag && !dragState.hasMoved) {
      // First time we detect actual dragging movement
      setDragState(prev => ({ ...prev, hasMoved: true }));
      // Hide tooltip and hover label when we start actually dragging
      setTooltip(prev => ({ ...prev, visible: false }));
      setHoverLabel(prev => ({ ...prev, visible: false }));
    }

    if (isDrag) {
      setPan({
        x: dragState.startPanX + deltaX,
        y: dragState.startPanY + deltaY
      });
    }
  }, [dragState]);

  const handleMouseUpGlobal = useCallback(() => {
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, isDragging: false, hasMoved: false }));
    }
  }, [dragState.isDragging]);

  // Global mouse event listeners for dragging
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      
      // Only change cursor and disable selection if we're actually dragging
      if (dragState.hasMoved) {
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUpGlobal);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragState.isDragging, dragState.hasMoved, handleMouseMoveGlobal, handleMouseUpGlobal]);

  // Reset pan when zoom is reset
  const handleResetZoom = () => {
    resetZoom();
    setPan({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-gray-100 overflow-hidden">
      <ClickIndicator clickedElement={clickedElement} />
      <UploadControls isLoading={isLoading} onFileUpload={handleFileUpload} />
      <Tooltip tooltip={tooltip} />
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={handleResetZoom} />
      <ElementList svgElements={svgElements} />

      <div className="w-full h-full flex items-center justify-center">
        {svgContent ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              ref={svgContainerRef}
              className="max-w-full max-h-full select-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center',
                transition: (dragState.isDragging && dragState.hasMoved) ? 'none' : 'transform 0.1s ease-out',
                cursor: (dragState.isDragging && dragState.hasMoved) ? 'grabbing' : 'grab'
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              dangerouslySetInnerHTML={{ __html: svgContent }}
              // onMouseEnter={handleSVGElementMouseEnter}
              // onMouseMove={handleMouseMove}
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
            <p className="text-sm">Click &quot;Upload SVG&quot; to get started</p>
          </div>
        )}
      </div>

      {/* Instructions overlay */}
      {svgContent && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
          <div>🖱️ Drag to pan • 🔍 Scroll to zoom • 🎯 Click elements</div>
        </div>
      )}

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