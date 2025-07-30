'use client';
import { useState } from 'react';
import { SVGElementData } from '../types';
import { 
  parseElementPosition, 
  assignElementId, 
  generateElementTitle, 
  addHoverClass 
} from '../utils/svgUtils';

export const useSVGProcessor = () => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [svgElements, setSvgElements] = useState<SVGElementData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const processSVGContent = (svgText: string): void => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (!svgElement) {
      alert('Invalid SVG file');
      return;
    }

    const interactiveElements = svgElement.querySelectorAll(
      'rect, circle, ellipse, polygon, path, g, text, line, polyline'
    );
    const elementsData: SVGElementData[] = [];

    interactiveElements.forEach((element, index) => {
      const tagName = element.tagName.toLowerCase();
      
      // Get existing ID or assign sequential ID if none exists
      const elementId = element.id || assignElementId(element, index);
      if (!element.id) {
        element.setAttribute('id', elementId);
      }
      
      // Get title from data-title attribute, fallback to ID, then fallback to sequential
      const dataTitle = element.getAttribute('data-title');
      const title = dataTitle || elementId || generateElementTitle(index);
      
      console.log(`Processing element: ${title} (${tagName}) ${elementId}`);

      const positionData = parseElementPosition(element, tagName);

      const elementData: SVGElementData = {
        id: elementId,
        title: title,
        type: tagName,
        element: element.outerHTML,
        index: index + 1,
        ...positionData
      };

      elementsData.push(elementData);
      addHoverClass(element);
    });

    setSvgContent(svgElement.outerHTML);
    setSvgElements(elementsData);
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
      alert('Please select an SVG file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      processSVGContent(text);
    } catch (error) {
      console.error('Error reading SVG file:', error);
      alert('Error reading SVG file');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    svgContent,
    svgElements,
    isLoading,
    handleFileUpload
  };
};