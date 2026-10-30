import type { FC } from "react";

import { WorkExperience } from "./components/WorkExperience";
import { Education } from "./components/Education";
import { Languages } from "./components/Languages";
import { Projects } from "./components/Projects";

import LoaderBlock from "../../../components/shared/loader-block/loader-block";

import { useT } from "../../../i18n/use-t";
import { useGetUserWorkExperience } from "./hooks/useGetUserWorkExperience";
import { useGetUserEducation } from "./hooks/useGetUserEducation";
import { useGetUserLanguages } from "./hooks/useGetUserLanguages";
import { useGetUserProjects } from "./hooks/useGetUserProjects";
import ErrorBlock from "@/components/shared/error-block/error-block";

const Settings: FC = () => {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");

    const {
        data: workExperience,
        isError: isWorkExperienceError,
        isLoading: isWorkExperienceLoading,
        isSuccess: isWorkExperienceSuccess,
    } = useGetUserWorkExperience();

    const {
        data: education,
        isError: isEducationError,
        isLoading: isEducationLoading,
        isSuccess: isEducationSuccess,
    } = useGetUserEducation();

    const {
        data: languages,
        isError: isLanguagesError,
        isLoading: isLanguagesLoading,
        isSuccess: isLanguagesSuccess,
    } = useGetUserLanguages();
    const {
        data: projects,
        isError: isProjectsError,
        isLoading: isProjectsLoading,
        isSuccess: isProjectsSuccess,
    } = useGetUserProjects();

    return (
        <div className="experience">
            <div className="experienceHeader">
                <div className="experienceHeader__icon">💼</div>
                <div className="experienceHeader__wrapper">
                    <h1 className="experienceHeader__title">{t("experience.title")}</h1>
                    <p className="experienceHeader__description">{t("experience.description")}</p>
                </div>
            </div>
            {isWorkExperienceLoading || isEducationLoading || isLanguagesLoading || isProjectsLoading ? (
                <div className="experience__loader">
                    <LoaderBlock className="loader-block--blue" />
                </div>
            ) : isWorkExperienceError || isEducationError || isLanguagesError || isProjectsError ? (
                <ErrorBlock message={tErrors("generic.tryAgainSoon")} />
            ) : isWorkExperienceSuccess &&
              workExperience &&
              isEducationSuccess &&
              education &&
              isLanguagesSuccess &&
              languages &&
              isProjectsSuccess &&
              projects ? (
                <>
                    <WorkExperience data={workExperience} />
                    <Education data={education} />
                    <Languages data={languages} />
                    <Projects data={projects} />
                </>
            ) : (
                <p>{t("noData")}</p>
            )}
        </div>
    );
};

export default Settings;
