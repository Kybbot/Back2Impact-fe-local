import { useQuery } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { GetUserLanguagesType } from "../../../../services/user-service/types";

export const useGetUserLanguages = () => {
    return useQuery<GetUserLanguagesType>({
        queryKey: ["get-user-languages"],
        queryFn: async () => {
            const data = await userService.getUserLanguages();

            return data;
        },
    });
};
