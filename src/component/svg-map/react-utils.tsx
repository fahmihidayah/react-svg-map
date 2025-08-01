import React from "react";
import { SvgNode, TSvg } from "./types";


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


export function createNodeElement(node: SvgNode, key?: number): React.ReactElement | string {
    const { tag, attributes, children } = node;

     if (tag === "textNode") {
        return attributes.textContent as string;
    }

    const props: Record<string, any> = { key };

    for (const [attrName, attrValue] of Object.entries(attributes)) {
        if (attrName === "style" && typeof attrValue === "object") {
            props.style = attrValue;
        } else {
            props[attrName] = attrValue;
        }
    }

    const childElements = children.map((child, index) =>
        createNodeElement(child, index)
    );



    return React.createElement(tag, {
        ... props}, ...childElements);
}

export function renderSvgNodes(nodes: SvgNode[]): React.ReactNode {
    return nodes.map((node, index) => createNodeElement(node, index));
}
