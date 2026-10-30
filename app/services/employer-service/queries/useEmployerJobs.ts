import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { GetEmployerJobsDTO } from "../types";

export const useEmployerJobs = (params: GetEmployerJobsDTO) => {
    return useQuery({
        queryKey: [...queryKeys.employerJobs, params],
        queryFn: () => employerService.getEmployerJobs(params),
        placeholderData: keepPreviousData,
    });
};
