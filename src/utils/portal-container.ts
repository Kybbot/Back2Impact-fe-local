/**
 * The #portal node lives in the <body> of src/root.tsx.
 * Resolved lazily so it is never touched during a server render.
 */
export const getPortalContainer = () =>
    typeof document === "undefined" ? undefined : (document.getElementById("portal") ?? undefined);
