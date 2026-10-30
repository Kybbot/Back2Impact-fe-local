import instance from "../../api/instance";

import type { FetchJobsDTO, GetAllJobsListType, GetOneJobType, GetUserJobsDTO } from "@/types/jobs";

class JobService {
    async getDefaultJobs(pl: FetchJobsDTO) {
        const res = await instance.post<GetAllJobsListType>("/jobs", pl);

        return res;
    }

    async getUserJobs(pl: GetUserJobsDTO) {
        const res = await instance.post<GetAllJobsListType>(`/jobs`, pl);

        return res;
    }

    async getOneJob(id: string | number) {
        const res = await instance.get<GetOneJobType>(`/jobs/${id}`);

        return res;
    }
}

export default new JobService();
