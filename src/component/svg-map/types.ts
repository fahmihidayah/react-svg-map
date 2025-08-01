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
            styleObj[camelCase(prop.trim())] = value.trim();
        }
    }
    return styleObj;
}

function parseElement(el: Element): SvgNode {
    const attrs: Record<string, string | Record<string, string>> = {};

    for (const attr of el.attributes) {
        let name = attr.name === "class" ? "className" : camelCase(attr.name);
        if (name === "style") {
            attrs["style"] = parseStyle(attr.value);
        } else {
            attrs[name] = attr.value;
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
    if(textContent) {
        children.push({
            tag: "textNode",
                attributes: { textContent: textContent},
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

    console.log("result : ", nodes)

    return nodes;
}