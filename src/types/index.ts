export interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

export interface HoverLabelState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

export interface SVGElementData {
  id: string;
  title: string;
  type: string;
  element: string;
  index: number;
  x?: number;
  y?: number;
  width?: number;
}

export interface ZoomState {
  level: number;
  min: number;
  max: number;
  step: number;
}