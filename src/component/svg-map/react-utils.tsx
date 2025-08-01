import React from "react";
import { SvgNode } from "./types";

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
        className: "hover:bg-gray",
        ... props}, ...childElements);
}

export function renderSvgNodes(nodes: SvgNode[], onClick: (event : HTMLElement) => {}): React.ReactNode {
    return nodes.map((node, index) => createNodeElement(node, onClick, index));
}
