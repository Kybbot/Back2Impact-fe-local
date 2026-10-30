import type { UserData, UserRole } from "../services/user-service/types";

/**
 * Where each kind of account lives. Candidates and employers share the session
 * and the `/users/me` query but have separate cabinets, and every redirect that
 * sends a user "home" goes through here so the two never cross.
 */

/** the first page of the account's setup flow; a `created` account is kept inside it */
export const getSetupPath = (user: Pick<UserData, "role">) =>
    user.role === "employer" ? "/employers/setup" : "/onboarding/about-you";

/** the prefix every page of the setup flow lives under */
export const getSetupPrefix = (user: Pick<UserData, "role">) =>
    user.role === "employer" ? "/employers/setup" : "/onboarding";

export const getHomePath = (user: Pick<UserData, "role" | "status">) => {
    if (user.status === "created") return getSetupPath(user);

    return user.role === "employer" ? "/employers/dashboard" : "/jobs/all";
};

/** the account's own page: the candidate's profile, or the dashboard the company profile lives on */
export const getProfilePath = (user: Pick<UserData, "role" | "status">) => {
    if (user.status === "created") return getSetupPath(user);

    return user.role === "employer" ? "/employers/dashboard" : "/profile/about-me";
};

export const getAuthPath =(role: UserRole | null | undefined) =>
    role === "employer" ? "/employers/auth" : "/auth";

export const getLoginPath = (role: UserRole | null | undefined) => `${getAuthPath(role)}?tab=login`;
