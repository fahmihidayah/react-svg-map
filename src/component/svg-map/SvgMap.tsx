'use client';
import { forwardRef, HTMLAttributes, useEffect, useState } from "react";
import { SvgComponent, SvgComponentProps } from "./Svg";
import { parseSvgNodes, SvgNode } from "./types";
import { TSvg } from "./old-data/types";
import { parseSvg } from "./old-data/utils";
import { createNodeElement, renderSvgNodes } from "./react-utils";

type Props = SvgComponentProps & {
    content?: string;
}

export const SvGMap = ({ content, onClick, className }: Props) => {
    const [svgNodes, setSvgNodes] = useState<SvgNode[]>([]);

    const [internalContent, setInternalContent] = useState<string | undefined>(undefined);

    const [svg, setSvg] = useState<TSvg | undefined>(undefined);

    useEffect(() => {
        if (content && content !== internalContent) {
            setSvgNodes(parseSvgNodes(content))
            setSvg(parseSvg(content))
            setInternalContent(content);
        }
    }, [content]);

    return (
        <SvgComponent
            key="12"
            style={{
                'background': 'white'
            }}
            onClick={onClick}
            {
            ... ((svg || {}) as React.SVGProps<SVGSVGElement>)
            }
        >
            <style>
                
            </style>
            {
                svgNodes.map((node, index) => createNodeElement(node, index))
            }
        </SvgComponent>
    )

}