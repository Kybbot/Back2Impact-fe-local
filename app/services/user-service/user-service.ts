import instance from "../../api/instance";
import type { BasicInfo, PostFileDTO } from "./types";
import type {
    AddUserEducationBodyType,
    AddUserLanguageBodyType,
    AddUserProjectBodyType,
    AddUserWorkExperienceBodyType,
    ChangeEmployerSettingsBodyType,
    ChangeUserPasswordBodyType,
    ChangeUserSettingsBodyType,
    DeleteAccountBodyType,
    FileInfo,
    GetUserEducationType,
    GetUserLanguagesType,
    GetUserProjectsType,
    GetUserSettingsType,
    GetUserWorkExperienceType,
    OnboardingInfo,
    PatchFile,
    PostJobApplyDTO,
    PostJobApplyFileDTO,
    UserData,
} from "./types";

/**
 * Everything under `/user/*`. All of it goes through the shared http client,
 * so an expired token is refreshed and a failure is an `ApiError` — no method
 * here inspects status codes on its own.
 */
class UserService {
    getMe() {
        return instance.get<UserData>("/user/me");
    }

    patchOnboarding(pl: OnboardingInfo) {
        return instance.patch("/user/onboarding", pl);
    }

    postFile(pl: FileInfo) {
        return instance.post<{ url: string; key: string }>("/user/profile/file", pl);
    }

    patchFile(pl: PatchFile) {
        return instance.patch("/user/profile/file", pl);
    }

    postJobSave(jobId: number) {
        return instance.post<{ savedCount: number }>("/user/jobs/saved", { jobId });
    }

    deleteJobSave(jobId: number) {
        return instance.delete<{ savedCount: number }>(`/user/jobs/saved/${jobId}`);
    }

    postJobApplyFile(pl: PostJobApplyFileDTO) {
        return instance.post<{ key: string; url: string }>("/user/jobs/apply-file", pl);
    }

    postJobApply(pl: PostJobApplyDTO) {
        return instance.post("/user/jobs/applied", pl);
    }

    getBasicInfo() {
        return instance.get<BasicInfo>("/user/basic-info");
    }

    patchBasicInfo(pl: BasicInfo) {
        return instance.patch("/user/basic-info", pl);
    }

    getUserSettings() {
        return instance.get<GetUserSettingsType>("/user/settings");
    }

    changeUserSettings(pl: ChangeUserSettingsBodyType) {
        return instance.put("/user/settings", pl);
    }

    changeEmployerSettings(pl: ChangeEmployerSettingsBodyType) {
        return instance.put("/user/employers/settings", pl);
    }

    changeUserPassword(pl: ChangeUserPasswordBodyType) {
        return instance.post("/user/change-password", pl);
    }

    deleteAccount(pl: DeleteAccountBodyType) {
        return instance.delete<{ message: string }>("/user/me", pl);
    }

    getUserWorkExperience() {
        return instance.get<GetUserWorkExperienceType>("/user/experience");
    }

    addUserWorkExperience(pl: AddUserWorkExperienceBodyType) {
        return instance.post("/user/experience", pl);
    }

    editUserWorkExperience(id: string, pl: AddUserWorkExperienceBodyType) {
        return instance.put(`/user/experience/${id}`, pl);
    }

    deleteUserWorkExperience(id: string) {
        return instance.delete(`/user/experience/${id}`);
    }

    getUserEducation() {
        return instance.get<GetUserEducationType>("/user/education");
    }

    addUserEducation(pl: AddUserEducationBodyType) {
        return instance.post("/user/education", pl);
    }

    editUserEducation(id: string, pl: AddUserEducationBodyType) {
        return instance.put(`/user/education/${id}`, pl);
    }

    deleteUserEducation(id: string) {
        return instance.delete(`/user/education/${id}`);
    }

    getUserLanguages() {
        return instance.get<GetUserLanguagesType>("/user/languages");
    }

    editUserLanguage(pl: AddUserLanguageBodyType) {
        return instance.put("/user/languages", pl);
    }

    getUserProjects() {
        return instance.get<GetUserProjectsType>("/user/projects");
    }

    addUserProject(pl: AddUserProjectBodyType) {
        return instance.post("/user/projects", pl);
    }

    editUserProject(id: string, pl: AddUserProjectBodyType) {
        return instance.put(`/user/projects/${id}`, pl);
    }

    deleteUserProject(id: string) {
        return instance.delete(`/user/projects/${id}`);
    }

    getProfilePicPresign(pl: { mimeType: string; size: number }) {
        return instance.get<{ url: string; key: string }>("/user/profile/pic/presign", { params: pl });
    }

    putProfilePic(key: string) {
        return instance.put("/user/profile/pic", { key });
    }

    postUserFile(pl: PostFileDTO) {
        return instance.post("/user/file", pl);
    }

    getPresign(pl: { mimeType: string; type: string; size: number }) {
        return instance.get<{ url: string; key: string }>("/user/presign", { params: pl });
    }

    patchCoverLetter(coverLetter: string | null) {
        return instance.patch("/user/cover-letter", { coverLetter });
    }

    deleteFile(id: number) {
        return instance.delete(`/user/file/${id}`);
    }
}

export default new UserService();
