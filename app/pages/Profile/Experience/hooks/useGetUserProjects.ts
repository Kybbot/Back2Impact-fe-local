import { useQuery } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { GetUserProjectsType } from "../../../../services/user-service/types";

export const useGetUserProjects = () => {
    return useQuery<GetUserProjectsType>({
        queryKey: ["get-user-projects"],
        queryFn: async () => {
            const data = await userService.getUserProjects();

            return data;
        },
    });
};
