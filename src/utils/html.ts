/** the entities a rich-text editor escapes in its HTML */
const ENTITIES: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
};

/** the text a reader sees in a rich-text editor's HTML, with nothing between its blocks */
export const htmlToText = (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity]);

// The description is HTML, but some vacancies carry plain-text line breaks inside it.
// Text between two tags that is only whitespace is source formatting (`</li>\n<li>`),
// so only newlines inside actual text become <br />.
export const withLineBreaks = (html: string) =>
    html
        .split(/(<[^>]*>)/)
        .map((part, i) => (i % 2 || !part.trim() ? part : part.replace(/\r?\n/g, "<br />")))
        .join("");
