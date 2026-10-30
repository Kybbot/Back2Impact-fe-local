import { useQuery } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { GetUserWorkExperienceType } from "../../../../services/user-service/types";

export const useGetUserWorkExperience = () => {
    return useQuery<GetUserWorkExperienceType>({
        queryKey: ["get-user-work-experience"],
        queryFn: async () => {
            const data = await userService.getUserWorkExperience();

            return data;
        },
    });
};
