import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { PutCompanyDTO } from "../types";

export const usePutCompany = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, PutCompanyDTO>({
        mutationFn: async (pl) => {
            const data = await employerService.putCompany(pl);

            return data;
        },
        // `me` carries the company name and the setup status the guards read
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: queryKeys.me });
        },
    });
};
