import EmployerVacancies from "../pages/Employers/Vacancies/vacancies";
import { redirect } from "../i18n/navigation";
import { requireUser } from "../utils/require-user";
import { isCompanyComplete } from "../utils/company";

import type { Route } from "./+types/employers.vacancies";

/** vacancies are posted under the company, so until it is filled in the dashboard is where to do that */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    const user = await requireUser(request, "employer");

    if (!isCompanyComplete(user.company)) throw redirect("/employers/dashboard", request);

    return null;
}

export function HydrateFallback() {
    return null;
}

export default EmployerVacancies;
