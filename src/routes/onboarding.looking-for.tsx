import LookingForCard from "@/pages/Onboarding/looking-for-card/looking-for-card";

// client-only route: a `clientLoader` with no server `loader` plus a
// `HydrateFallback` keeps this component out of the server render
export async function clientLoader() {
    return null;
}

export function HydrateFallback() {
    return null;
}

export default LookingForCard;
