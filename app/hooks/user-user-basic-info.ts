import { useQuery } from "@tanstack/react-query"
import userService from "../services/user-service/user-service"

export const useUserBasicInfo = () => {
    return useQuery({
        queryKey: ['userBasicInfo'],
        queryFn: async () => {
            try {
                const result = await userService.getBasicInfo();

                return result;
            } catch { return null }
        }
    })
}