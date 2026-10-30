/**
 * Anything under /jobs that is not a real route is a 404, not a redirect to
 * the listing. Redirecting made every misspelled URL answer 200 with the same
 * content, which is what "soft 404" means to a crawler.
 *
 * The response is rendered by the ErrorBoundary in app/root.tsx.
 */
export function loader() {
    throw new Response("Not Found", { status: 404 });
}

export default function JobsCatchAllRoute() {
    return null;
}
