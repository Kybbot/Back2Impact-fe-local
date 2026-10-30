import EmployerCandidates from "../pages/Employers/Candidates/candidates";
import { redirect } from "../i18n/navigation";
import { requireUser } from "../utils/require-user";
import { isCompanyComplete } from "../utils/company";

import type { Route } from "./+types/employers.candidates";

/** candidates apply to vacancies, so until the company is filled in there is nobody to show */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    const user = await requireUser(request, "employer");

    if (!isCompanyComplete(user.company)) throw redirect("/employers/dashboard", request);

    return null;
}

export function HydrateFallback() {
    return null;
}

export default EmployerCandidates;
