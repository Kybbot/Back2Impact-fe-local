import Component from "../pages/Profile/about-me-screen/about-me-screen";

// client-only route: a `clientLoader` with no server `loader` plus a
// `HydrateFallback` keeps this component out of the server render
export async function clientLoader() {
    return null;
}

export function HydrateFallback() {
    return null;
}

export default Component;
