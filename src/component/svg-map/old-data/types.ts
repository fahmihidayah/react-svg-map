export type TSvg = {
  id?: string;
  style?: string;
  [key: string]: any; // Allow custom attributes like data-*
};

export type TSvgNode = {
  type:
    | 'rect'
    | 'circle'
    | 'ellipse'
    | 'line'
    | 'polygon'
    | 'polyline'
    | 'path'
    | 'text'
    | 'g';

  // Common attributes
  id?: string;
  className?: string;
  style?: string;
  transform?: string;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';
  strokeDasharray?: string;
  strokeDashoffset?: number;
  strokeOpacity?: number;
  opacity?: number;

  // <rect>
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  ry?: number;

  // <circle>
  cx?: number;
  cy?: number;
  r?: number;

  // <ellipse>
  rxEllipse?: number;
  ryEllipse?: number;
  cxEllipse?: number;
  cyEllipse?: number;

  // <line>
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;

  // <polygon> / <polyline>
  points?: string;

  // <path>
  d?: string;

  // <text>
  textContent?: string;
  fontSize?: string;
  fontFamily?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: string;

  // For <g> (group) you may support children in the future
  children?: TSvgNode[];

  // Catch-all for custom attributes
  [key: string]: any;
};
