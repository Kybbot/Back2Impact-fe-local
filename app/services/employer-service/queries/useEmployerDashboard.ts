import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

export const useEmployerDashboard = () => {
    return useQuery({
        queryKey: queryKeys.employerDashboard,
        queryFn: () => employerService.getDashboard(),
        staleTime: 1000 * 60,
    });
};
