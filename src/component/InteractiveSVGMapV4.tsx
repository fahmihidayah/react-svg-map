'use client';

import { RotateCcw, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useRef, useState } from "react";

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


export default function InteractiveSVGMapV4() {

    const [svgContent, setSvgContent] = useState<string>('');

    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

    const [toasts, setToasts] = useState<Toast[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
        visible: false,
        x: 0,
        y: 0,
        content: ''
    });

    // Toast management
    const addToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);


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

    const zoomIn = useCallback(() => {
        setTransform(prev => ({
            ...prev,
            scale: Math.min(5, prev.scale * 1.2)
        }));
    }, []);

    const zoomOut = useCallback(() => {
        setTransform(prev => ({
            ...prev,
            scale: Math.max(0.1, prev.scale * 0.8)
        }));
    }, []);

    const resetView = useCallback(() => {
        setTransform({ x: 0, y: 0, scale: 1 });
    }, []);

    return <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
        <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
        />
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
        <div
                className="w-full h-full cursor-grab active:cursor-grabbing"
            // onMouseDown={handleMouseDown}
            // onMouseMove={handleMouseMove}
            // onMouseUp={handleMouseUp}
            // onMouseLeave={handleMouseLeave}

            // onMouseOver={handleSVGElementMouseEnter}
            // onMouseOut={handleSVGElementMouseLeave}
            // onWheel={handleWheel}
            >
                {tooltip.visible && (
                    <div
                        className="fixed z-50 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
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
                                borderTop: '4px solid #1f2937'
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
                        <p>Content here</p>
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
    </div>

}