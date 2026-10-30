import instance from "../../api/instance";

import type {
    PutCompanyDTO,
    EmployerDashboard,
    PutEmployerJobDTO,
    GetEmployerJobsDTO,
    PostCompanyLogoDTO,
    PostEmployerJobDTO,
    GetEmployerJobsResponse,
    PostCompanyLogoResponse,
    GetEmployerApplicationsDTO,
    GetEmployerApplicationsResponse,
    PatchEmployerJobStatusDTO,
    PatchEmployerApplicationStatusDTO,
} from "./types";

/**
 * The signed-in employer's side of the API: the company they represent
 * (`/companies/employers/*`), the vacancies it posted (`/jobs/employers`)
 * and the applications to them (`/jobs/employers/applications`).
 */
class EmployerService {
    getDashboard() {
        return instance.get<EmployerDashboard>("/companies/employers/dashboard");
    }

    getEmployerJobs(params: GetEmployerJobsDTO) {
        return instance.get<GetEmployerJobsResponse>("/jobs/employers", { params });
    }

    postEmployerJob(pl: PostEmployerJobDTO) {
        return instance.post("/jobs/employers", pl);
    }

    putEmployerJob({ id, pl }: PutEmployerJobDTO) {
        return instance.put(`/jobs/employers/${id}`, pl);
    }

    patchEmployerJobStatus({ id, ...pl }: PatchEmployerJobStatusDTO) {
        return instance.patch(`/jobs/employers/status/${id}`, pl);
    }

    /** only a draft can be deleted */
    deleteEmployerJob(id: number) {
        return instance.delete(`/jobs/employers/${id}`);
    }

    getApplications(params: GetEmployerApplicationsDTO) {
        return instance.get<GetEmployerApplicationsResponse>("/jobs/employers/applications", { params });
    }

    patchApplicationStatus({ id, ...pl }: PatchEmployerApplicationStatusDTO) {
        return instance.patch(`/jobs/employers/applications/status/${id}`, pl);
    }

    /** a presigned PUT url for the logo; the file itself goes straight to S3 */
    postCompanyLogo(pl: PostCompanyLogoDTO) {
        return instance.post<PostCompanyLogoResponse>("/companies/employers/logo", pl);
    }

    putCompany(pl: PutCompanyDTO) {
        return instance.put("/companies/employers", pl);
    }
}

export default new EmployerService();
