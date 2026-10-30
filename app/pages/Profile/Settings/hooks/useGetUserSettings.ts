import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../../api/query-keys";
import userService from "../../../../services/user-service/user-service";

import type { GetUserSettingsType } from "../../../../services/user-service/types";

export const useGetUserSettings = () => {
    return useQuery<GetUserSettingsType>({
        queryKey: queryKeys.userSettings,
        queryFn: async () => {
            const data = await userService.getUserSettings();

            return data;
        },
    });
};
