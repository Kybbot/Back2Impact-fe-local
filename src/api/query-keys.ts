/**
 * Query keys that more than one module needs to agree on. A key used in a
 * single hook can stay inline; these are referenced from mutations, loaders
 * and the http client as well.
 */
export const queryKeys = {
    /** the signed-in user, `null` when there is none — the source of truth for "logged in" */
    me: ["me"] as const,
    /** the four preference fields; also carried by `me`, which the mutation keeps in step */
    userSettings: ["get-user-settings"] as const,
    /** prefixes of the vacancy lists; they carry per-user fields and are refetched when the user changes */
    defaultJobs: ["defaultJobs"] as const,
    userJobs: ["userJobs"] as const,
    job: ["job"] as const,
    jobById: (id: string) => ["job", id] as const,
    employerDashboard: ["employer-dashboard"] as const,
    /** prefix of the employer's own vacancy list, one entry per page */
    employerJobs: ["employer-jobs"] as const,
    /** prefix of the applications to the employer's vacancies, one entry per page and filter */
    employerApplications: ["employer-applications"] as const,
};
