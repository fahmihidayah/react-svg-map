import { SVGElementData } from '../types';

export const parseElementPosition = (element: Element, tagName: string): Partial<SVGElementData> => {
  const baseData: Partial<SVGElementData> = {};
  
  if (tagName === 'rect') {
    baseData.x = parseFloat(element.getAttribute('x') || '0');
    baseData.y = parseFloat(element.getAttribute('y') || '0');
    baseData.width = parseFloat(element.getAttribute('width') || '0');
  }
  
  return baseData;
};

export const assignElementId = (element: Element, index: number): string => {
  return element.id || `element-${index + 1}`;
};

export const generateElementTitle = (index: number): string => {
  return `Shop ${index + 1}`;
};

export const addHoverClass = (element: Element): void => {
  const existingClass = element.getAttribute('class') || '';
  element.setAttribute('class', `${existingClass} hover-element`.trim());
};