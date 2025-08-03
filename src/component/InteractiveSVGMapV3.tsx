'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Upload, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { SvGMap } from './svg-map/SvgMap';
import useDissableZoom from '@/hooks/useDissableZoom';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface MouseClickTimer {
  elementId: string;
  startTime: number;
}

const InteractiveSVGMapV3: React.FC = () => {
  useDissableZoom()
  const [svgContent, setSvgContent] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });
  const [mouseClickTimer, setMouseClickTimer] = useState<MouseClickTimer>({
    elementId: '',
    startTime: 0,
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSVGElementMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }));
    }
  }, [tooltip.visible]);

  // Toast management
  const addToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      addToast('Please upload a valid SVG file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSvgContent(content);
      setTransform({ x: 0, y: 0, scale: 1 });
      addToast('SVG file loaded successfully!', 'success');
    };
    reader.readAsText(file);
  }, [addToast]);

  // Mouse event handlers for pan and zoom
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });

      const target = e.target as SVGElement;
      console.log(`Mouse Down on element: ${target.tagName} with ID: ${target.id}`);
      setMouseClickTimer({
        elementId: target.id || target.tagName,
        startTime: Date.now(),
      });
    }
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    } else {
      // Detect all path elements under mouse cursor
      const elementFromPoint = document.elementFromPoint(e.clientX, e.clientY);
      if (elementFromPoint && elementFromPoint.tagName.toLowerCase() === 'path') {
        const pathElement = elementFromPoint as SVGPathElement;
        const svgElement = pathElement.ownerSVGElement;

        if (svgElement) {
          const rect = svgElement.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Create a point for hit testing
          const point = svgElement.createSVGPoint();
          point.x = mouseX / transform.scale - transform.x / transform.scale;
          point.y = mouseY / transform.scale - transform.y / transform.scale;

          // Check if point is inside the path
          const isInside = pathElement.isPointInFill(point);

          // Get path bounding box
          const bbox = pathElement.getBBox();

          if (isInside) {
            console.log(`Mouse inside path "${pathElement.id || 'unnamed'}":`, {
              mousePosition: { x: point.x, y: point.y },
              pathBounds: {
                x: Math.round(bbox.x * 100) / 100,
                y: Math.round(bbox.y * 100) / 100,
                width: Math.round(bbox.width * 100) / 100,
                height: Math.round(bbox.height * 100) / 100
              },
              relativePosition: {
                x: Math.round((point.x - bbox.x) * 100) / 100,
                y: Math.round((point.y - bbox.y) * 100) / 100,
                percentX: Math.round(((point.x - bbox.x) / bbox.width) * 10000) / 100,
                percentY: Math.round(((point.y - bbox.y) / bbox.height) * 10000) / 100
              }
            });
          }
        }
      }
    }
  }, [isDragging, dragStart, transform]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const currentTime = Date.now();
    const timeDiff = currentTime - mouseClickTimer.startTime;

    console.log(`Mouse Up on element: ${target.tagName} with ID: ${target.id} after ${timeDiff}ms`);

    // Check if it's a click (within 500ms) and the element has a valid tag
    if (timeDiff < 500 && target.tagName && target.tagName !== 'svg' && target.tagName !== 'DIV' && target.id) {
      const elementId = target.getAttribute("data-title") || target.tagName;
      addToast(`Clicked: ${elementId}`, 'info');
    }

    setIsDragging(false);
    setMouseClickTimer({ elementId: '', startTime: 0 });
  }, [mouseClickTimer.startTime, addToast]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setMouseClickTimer({ elementId: '', startTime: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;


    const newScale = Math.max(0.1, Math.min(5, transform.scale * scaleFactor));

    if (newScale <= 1.8 && newScale >= 0.5) {
      console.log("n", newScale)
      setTransform(prev => ({
        x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
        y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
        scale: newScale
      }));
    }


  }, [transform.scale]);

  // SVG element hover handlers
  const handleSVGElementClick = useCallback((e: React.MouseEvent) => {
    // Prevent default to avoid double handling
    e.preventDefault();
  }, []);



  const handleSVGElementMouseEnter = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    console.log(`Mouse Enter on element: ${target.tagName} with ID: ${target.id} ${target.style}`);
    if (target.tagName && target.id) {
      const elementId = target.id || `${target.tagName}-${Math.random().toString(36).substr(2, 4)}`;
      setHoveredElement(elementId);
      const elementInfo = target.getAttribute('data-title') || target.tagName;
      const elementClass = target.className?.baseVal || target.getAttribute('class') || '';
      const tooltipContent = elementClass ? `${elementInfo}` : elementInfo;
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        content: tooltipContent
      });
      // Apply hover effect

      const hoverStyles = {
        fill: '#9ca3af',
        stroke: '#9ca3af',
        cursor: 'pointer',
        // You can add more styles here
        strokeWidth: '2',
        opacity: '0.8'
      };

      // Method 1: Using Object.assign to merge styles
     

      // Method 2: Alternative - using individual assignments with a loop
      // Object.entries(hoverStyles).forEach(([property, value]) => {
      //   target.style[property as any] = value;
      // });

      // Method 3: Alternative - storing original styles for later restoration
      if (!target.dataset.originalStyles) {
        const originalStyles = {
          fill: target.style.fill || '',
          stroke: target.style.stroke || '',
          cursor: target.style.cursor || '',
          strokeWidth: target.style.strokeWidth || '',
          opacity: target.style.opacity || ''
        };
        target.dataset.originalStyles = JSON.stringify(originalStyles);
      }
       Object.assign(target.style, hoverStyles);
      // target.style.fill = '#9ca3af';
      // target.style.stroke = '#9ca3af';
      // target.style.cursor = 'pointer';
    }
  }, []);

  const handleSVGElementMouseLeave = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    setHoveredElement(null);
    setTooltip(prev => ({ ...prev, visible: false }));
    if (target.dataset.originalStyles) {
      const originalStyles = JSON.parse(target.dataset.originalStyles);
      Object.assign(target.style, originalStyles);
    } else {
      // Fallback: reset to default values
      const resetStyles = {
        fill: '',
        stroke: '',
        cursor: '',
        strokeWidth: '',
        opacity: ''
      };
      Object.assign(target.style, resetStyles);
    }
    // Remove hover effect
    // target.style.fill = '#9ca3af';
    // target.style.stroke = '#9ca3af';
    // target.style.cursor = '';
  }, []);
  const zoomIn = useCallback(() => {
    const newScale = Math.min(1.8, transform.scale * 1.2);

    // Prevent zoom-in if already at max
    if (newScale === transform.scale) return;

    setTransform(prev => ({
      ...prev,
      scale: newScale,
    }));
  }, [transform.scale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(0.5, transform.scale * 0.8);

    // Prevent zoom-out if already at min
    if (newScale === transform.scale) return;

    setTransform(prev => ({
      ...prev,
      scale: newScale,
    }));
  }, [transform.scale]);

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // Process SVG content to add event handlers
  const processedSVGContent = React.useMemo(() => {
    if (!svgContent) return '';

    // Create a temporary div to parse the SVG
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgContent;
    const svgElement = tempDiv.querySelector('svg');

    if (svgElement) {
      // Add event handlers to all child elements
      const addEventHandlers = (element: Element) => {
        if (element.tagName !== 'svg') {
          element.setAttribute('style', 'transition: all 0.2s ease;');
        }

        Array.from(element.children).forEach(addEventHandlers);
      };

      addEventHandlers(svgElement);
      return tempDiv.innerHTML;
    }

    return svgContent;
  }, [svgContent]);

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-40 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <Upload size={16} />
          Upload SVG
        </button>

        <div className="flex gap-1">
          <button
            onClick={zoomIn}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="text-xs text-gray-600 text-center">
          Scale: {Math.round(transform.scale * 100)}%
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}

        onMouseOver={handleSVGElementMouseEnter}
        onMouseOut={handleSVGElementMouseLeave}
        onWheel={handleWheel}
      >
        {tooltip.visible && (
          <div
            className="fixed z-50  bg-blue-400 px-2 text-white text-sm rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 10}px`,
              maxWidth: '200px',
              wordWrap: 'break-word'
            }}
          >
            <div className="font-medium">{tooltip.content}</div>
            {/* Tooltip arrow */}
            <div
              className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #60A5FA'
              }}
            />
          </div>
        )}
        {svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0'
            }}
          >
            <SvGMap
              content={svgContent}

              onClick={handleSVGElementClick}
              // onMouseOver={handleSVGElementMouseEnter}
              // onMouseOut={handleSVGElementMouseLeave}
              className="max-w-full max-h-full"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload an SVG file to get started</h3>
              <p className="text-sm">Click the upload button or drag and drop an SVG file</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {svgContent && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-600 max-w-xs">
          <div className="font-medium mb-1">Controls:</div>
          <div>• Hold and drag to pan</div>
          <div>• Mouse wheel to zoom</div>
          <div>• Quick click SVG elements for info (&lt;500ms)</div>
          <div>• Hover elements to highlight</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveSVGMapV3;