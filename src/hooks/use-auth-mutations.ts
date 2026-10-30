import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { queryKeys } from "../api/query-keys";
import authService, {
    type EmployerSignUpDTO,
    type LoginDTO,
    type SignUpDTO,
} from "../services/auth-service/auth-service";
import { meQuery } from "./useCurrentUser";

/**
 * The auth actions. Each one is a mutation whose `onSuccess` brings the query
 * cache in line with the new session, and the promise returned there is
 * awaited by `mutateAsync` — so by the time a caller navigates on, the `me`
 * query already holds the answer the guards will ask for.
 */

/** the lists carry per-user fields (score / isSaved / isApplied), so a change of user refetches them */
const invalidateJobs = (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: queryKeys.defaultJobs });
    qc.invalidateQueries({ queryKey: queryKeys.job });
};

/**
 * After login / sign-up / e-mail verification. `fetchQuery` rather than
 * `invalidateQueries`: the latter only refetches queries that currently have
 * an observer, and the auth page has none.
 */
const loadSession = async (qc: QueryClient) => {
    await qc.fetchQuery({ ...meQuery(), staleTime: 0 });
    invalidateJobs(qc);
};

/**
 * After logout / account deletion. `me` becomes `null` rather than being
 * removed, so nothing re-seeds it; everything fetched on the user's behalf is
 * dropped, and the observers still mounted simply refetch anonymously.
 */
export const clearSession = (qc: QueryClient) => {
    qc.setQueryData(queryKeys.me, null);
    qc.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.me[0] });
};

export const useLogin = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (pl: LoginDTO) => authService.login(pl),
        onSuccess: () => loadSession(qc),
    });
};

export const useSignUp = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (pl: SignUpDTO) => authService.signUp(pl),
        onSuccess: () => loadSession(qc),
    });
};

export const useEmployerSignUp = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (pl: EmployerSignUpDTO) => authService.employerSignUp(pl),
        onSuccess: () => loadSession(qc),
    });
};

export const useVerifyEmail = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (token: string) => authService.verifyEmail(token),
        onSuccess: () => loadSession(qc),
    });
};

export const useLogout = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => clearSession(qc),
    });
};
