import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { GetEmployerApplicationsDTO } from "../types";

export const useEmployerApplications = (params: GetEmployerApplicationsDTO) => {
    return useQuery({
        queryKey: [...queryKeys.employerApplications, params],
        queryFn: () => employerService.getApplications(params),
        placeholderData: keepPreviousData,
    });
};
