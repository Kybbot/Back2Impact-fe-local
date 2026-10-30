import { redirect } from "react-router";

// 301 rather than the default 302: /jobs is a permanent alias of /jobs/all,
// and a permanent redirect passes ranking signals on to the target
export function loader() {
    return redirect("/jobs/all", 301);
}

export default function JobsIndexRoute() {
    return null;
}
