import { useMutation } from "@tanstack/react-query";

import userService from "../user-service";
import type { PostJobApplyFileDTO } from "../types";

export const usePostJobApplyFile = () => {
    return useMutation<{ key: string; url: string }, unknown, PostJobApplyFileDTO>({
        mutationFn: async (pl) => {
            const data = await userService.postJobApplyFile(pl);

            return data;
        },
    });
};
