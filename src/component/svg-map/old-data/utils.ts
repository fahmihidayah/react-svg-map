import { TSvg, TSvgNode } from "./types";

export function parseSvg(svgString: string): TSvg {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return {};

    const svgAttrs: TSvg = {};

    for (const attr of Array.from(svg.attributes)) {
        let camelKey = attr.name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());


        console.log("value : ", camelKey, attr.value)
        // Try to parse as number, but preserve string if not a valid number
        if (camelKey === 'class') {
            camelKey = 'className';
        }
        else if (camelKey !== 'style') {
            svgAttrs[camelKey] = attr.value;
        }

    }

    console.log("attributes ", JSON.stringify(svgAttrs))

    return svgAttrs;
}

export function parseSvgNodes(svgString: string): TSvgNode[] {
    // Parse the SVG string into a DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return [];

    // Extract CSS styles from <style> elements
    const styleMap = new Map<string, Record<string, string>>();
    const styleElements = svg.querySelectorAll('style');
    
    styleElements.forEach(styleEl => {
        const cssText = styleEl.textContent || '';
        // Simple CSS parser for class selectors
        const classMatches = cssText.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g);
        
        if (classMatches) {
            classMatches.forEach(match => {
                const [, className, rules] = match.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/) || [];
                if (className && rules) {
                    const styleObj: Record<string, string> = {};
                    rules.split(';').forEach(rule => {
                        const [prop, val] = rule.split(':').map(s => s.trim());
                        if (prop && val) {
                            // Convert CSS property to camelCase
                            const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                            styleObj[camelProp] = val;
                        }
                    });
                    styleMap.set(className, styleObj);
                }
            });
        }
    });

    const supportedTags = ['rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'text', 'g'];
    const elements = Array.from(svg.querySelectorAll(supportedTags.join(',')));

    return elements.map((el) => {
        const type = el.tagName as TSvgNode['type'];
        const attributes: TSvgNode = { type };

        // Convert each attribute into camelCase and parse values
        for (const attr of Array.from(el.attributes)) {
            let camelKey = attr.name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            const num = parseFloat(attr.value);
            const value = isNaN(num) ? attr.value : num;
            
            if (camelKey === 'class') {
                camelKey = 'className';
                // Apply CSS class styles
                const classNames = attr.value.split(' ');
                classNames.forEach(className => {
                    const classStyles = styleMap.get(className);
                    if (classStyles) {
                        Object.assign(attributes, classStyles);
                    }
                });
            }

            if (type === 'ellipse') {
                if (camelKey === 'rx' && typeof value === 'number') attributes.rxEllipse = value;
                else if (camelKey === 'ry' && typeof value === 'number') attributes.ryEllipse = value;
                else if (camelKey === 'cx' && typeof value === 'number') attributes.cxEllipse = value;
                else if (camelKey === 'cy' && typeof value === 'number') attributes.cyEllipse = value;
                else attributes[camelKey] = value;
            }
            else if (type === 'text' && camelKey === 'textContent') {
                // Skip this - we'll handle text content separately below
                continue;
            }
            else {
                attributes[camelKey] = value;
            }
        }

        // If it's a <text> element, extract the text content properly
        if (type === 'text') {
            attributes.textContent = el.textContent?.trim() || '';
        }

        return attributes;
    });
}