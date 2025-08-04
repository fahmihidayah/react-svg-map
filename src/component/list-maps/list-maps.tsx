'use client'
import { useEffect, useState } from "react";
import InteractiveSVGMapV3 from "../InteractiveSVGMapV3";

const listOfContents = [
    "maps/grand_plaza_mall_map_with_icons.svg",
    "maps/test-path-3.svg",
    "maps/test-path-4.svg",
]

export default function ListMaps() {

    const [content, setContent] = useState<string | undefined>(undefined);
    const [index, setIndex] = useState(-1);

    useEffect(() => {
        if (index === -1) {
            setIndex(0)
        }
        else {
            const loadSvg = async () => {
                try {
                    const res = await fetch(`/${listOfContents[index]}`);
                    if (!res.ok) throw new Error('Failed to load SVG');

                    const text = await res.text();
                    if(text) {
                        setContent(text);
                    }
                   
                } catch (err) {
                    console.error('Error loading SVG:', err);
                    // addToast('Failed to load SVG file.', 'error');
                }
            };
            loadSvg()
        }
    }, [index])


    return <>
        <div className="flex gap-5 w-full items-center py-5">
            <button
                onClick={() => {
                    setIndex(0)
                }}
                className="bg-blue-100 text-blue-600 border-blue-600 px-4 py-2 hover:bg-blue-500 hover:text-white border rounded-xl">
                Floor 1
            </button>
            <button
                onClick={() => {
                    setIndex(1)
                }} className="bg-blue-100 text-blue-600 border-blue-600 px-4 py-2 hover:bg-blue-500 hover:text-white border rounded-xl">
                Floor 2
            </button>
            <button
                onClick={() => {
                    setIndex(2)
                }} className="bg-blue-100 text-blue-600 border-blue-600 px-4 py-2 hover:bg-blue-500 hover:text-white border rounded-xl">
                Floor 3
            </button>
        </div>
        <InteractiveSVGMapV3 content={content}   />
    </>
}