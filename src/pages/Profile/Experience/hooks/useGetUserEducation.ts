import { useQuery } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { GetUserEducationType } from "../../../../services/user-service/types";

export const useGetUserEducation = () => {
    return useQuery<GetUserEducationType>({
        queryKey: ["get-user-education"],
        queryFn: async () => {
            const data = await userService.getUserEducation();

            return data;
        },
    });
};
