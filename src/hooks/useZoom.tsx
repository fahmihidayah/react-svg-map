import { useState } from 'react';
import { ZoomState } from '../types';

export const useZoom = (initialZoom: number = 1) => {
  const [zoomState] = useState<ZoomState>({
    level: initialZoom,
    min: 0.5,
    max: 3,
    step: 0.1
  });

  const [zoom, setZoom] = useState<number>(zoomState.level);

  const zoomIn = (): void => {
    setZoom(prev => Math.min(prev + zoomState.step, zoomState.max));
  };

  const zoomOut = (): void => {
    setZoom(prev => Math.max(prev - zoomState.step, zoomState.min));
  };

  const resetZoom = (): void => {
    setZoom(zoomState.level);
  };

  const handleWheelZoom = (deltaY: number): void => {
    const delta = deltaY < 0 ? zoomState.step : -zoomState.step;
    setZoom(prev => Math.min(Math.max(prev + delta, zoomState.min), zoomState.max));
  };

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheelZoom
  };
};