'use client'
import { useEffect, useState } from "react";
import { parseSvg, parseSvgNodes, SvgNode, TSvg } from "./types";
import { createNodeElement } from "./react-utils";

type Props =  {
    content : string,
    onClickItem : (node : SvgNode) => void
}

export default function SvgMapV4({
    content,
onClickItem} : Props) {
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
    
    return <svg {... svg}>
        {
            svgNodes && svgNodes.map((e, index) => createNodeElement({
                node: e,
                key: index,
                onClick: (node) => {
                    onClickItem?.(node)
                }
            }))
        }
    </svg>
}