import { useMutation } from "@tanstack/react-query";

import authService from "../../auth-service/auth-service";

export const useRememberRedirect = () => {
    return useMutation<
        unknown,
        unknown,
        {
            path: string;
        }
    >({
        mutationFn: async ({ path }) => {
            const data = await authService.rememberRedirect(path);

            return data;
        },
    });
};
