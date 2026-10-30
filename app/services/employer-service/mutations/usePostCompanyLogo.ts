import { useMutation } from "@tanstack/react-query";

import employerService from "../employer-service";

import type { PostCompanyLogoDTO, PostCompanyLogoResponse } from "../types";

export const usePostCompanyLogo = () => {
    return useMutation<PostCompanyLogoResponse, unknown, PostCompanyLogoDTO>({
        mutationFn: async (pl) => {
            const data = await employerService.postCompanyLogo(pl);

            return data;
        },
    });
};
