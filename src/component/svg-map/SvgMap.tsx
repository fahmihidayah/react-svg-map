'use client';
import { useEffect, useState } from "react";
import { SvgComponent, SvgComponentProps } from "./Svg";
import { parseSvgNodes, SvgNode, TSvg } from "./types";
import { createNodeElement, parseSvg, renderSvgNodes } from "./react-utils";

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