export type TSvg = {
    id?: string;
    style?: string;
    [key: string]: string | undefined; // Allow custom attributes like data-*
};

export type SvgNode = {
    tag: string;
    attributes: Record<string, string | Record<string, string>>;
    children: SvgNode[];
};

const isCamelCaseExclude = (input: string): boolean => {
    return (
        input.startsWith("data-")
        || input.startsWith("aria-"))
}

const camelCase = (input: string): string => {
    if (isCamelCaseExclude(input)) return input;
    return input.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
};

function parseStyle(style: string): Record<string, string> {
    const styleObj: Record<string, string> = {};
    const entries = style.split(";").filter(Boolean);
    for (const entry of entries) {
        const [prop, value] = entry.split(":");
        if (prop && value) {
            if (prop === 'fill' && value === 'none') {
                styleObj[camelCase(prop.trim())] = 'transparent';
            }
            else {
                styleObj[camelCase(prop.trim())] = value.trim();
            }

        }
    }
    return styleObj;
}

function parseElement(el: Element): SvgNode {
    const attrs: Record<string, string | Record<string, string>> = {};

    for (const attr of el.attributes) {
        const name = attr.name === "class" ? "className" : camelCase(attr.name);
        console.log("attributes : ", attr)
        if (name === "style") {
            attrs["style"] = parseStyle(attr.value);
        } else {
            if (name === 'fill' && attr.value === 'none') {
                attrs[name] = 'transparent'
            }
            else {
                attrs[name] = attr.value;
            }

        }
    }


    const children: SvgNode[] = [];
    for (const child of el.children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(parseElement(child as Element));
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            children.push({
                tag: "textNode",
                attributes: { textContent: child.textContent.trim() },
                children: [],
            });
        }
    }


    const content = el.outerHTML;

    const match = `${content}`.match(/<text\b[^>]*>(.*?)<\/text>/i);
    const textContent = match ? match[1] : null;
    if (textContent) {
        children.push({
            tag: "textNode",
            attributes: { textContent: textContent },
            children: [],
        })
    }


    return {
        tag: el.tagName,
        attributes: attrs,
        children,
    };
}

export function parseSvgNodes(svgString: string): SvgNode[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.documentElement;

    const nodes: SvgNode[] = [];
    for (const child of svg.children) {
        nodes.push(parseElement(child));
    }

    return nodes;
}


export function parseSvg(svgString: string): TSvg {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return {};

    const svgAttrs: TSvg = {};

    for (const attr of Array.from(svg.attributes)) {
        let camelKey = attr.name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());


        // Try to parse as number, but preserve string if not a valid number
        if (camelKey === 'class') {
            camelKey = 'className';
        }
        else if (camelKey !== 'style') {
            svgAttrs[camelKey] = attr.value;
        }

    }

    return svgAttrs;
}

