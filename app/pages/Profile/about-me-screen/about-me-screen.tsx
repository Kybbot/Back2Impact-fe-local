import * as Sentry from "@sentry/react";
import { Trans } from "react-i18next";
import { useOutletContext } from "react-router";
import { Link } from "../../../i18n/navigation";
import completeIcon from "/img/complete-icon.svg";
import ProgressCircle from "./progress-circle";
import { Fragment } from "react/jsx-runtime";
import { useCountryLabel, useOptionLabel, useOptionMap } from "../../../i18n/options";
import { useT } from "../../../i18n/use-t";
import EditBasicInfoForm from "./edit-basic-info-form";
import { useRef, useState } from "react";
import type { BasicInfo, EditBasicInfoFormRef } from "./types";
import userService from "../../../services/user-service/user-service";
import { useUserBasicInfo } from "../../../hooks/user-user-basic-info";
import { formatLocations } from "../../../hooks/use-locations";
import s3Service from "../../../services/s3-service/s3-service";
import { toast } from "react-toastify";
import useCurrentUser from "../../../hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../api/query-keys";

type ProfileCtx = {
    profilePictureUrl?: string;
    userName: string;
    email: string;
};

function AboutMeScreen() {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const queryClient = useQueryClient();
    const optionLabel = useOptionLabel();
    const countryLabel = useCountryLabel();
    const regionLabels = useOptionMap("regions");
    const { data: user, refetch: refetchUser } = useCurrentUser();
    const { userName, profilePictureUrl, email } = useOutletContext<ProfileCtx>();
    const { data: basicInfo, refetch } = useUserBasicInfo();
    const editBasicInfoFormRef = useRef<EditBasicInfoFormRef>(null);
    const picInputRef = useRef<HTMLInputElement>(null);
    const [showEditBasicInfoForm, setShowEditBasicInfoForm] = useState(false);

    const handlePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];

            if (!file) return;

            const presignedUrl = await userService.getProfilePicPresign({
                mimeType: file.type,
                size: file.size,
            });

            await s3Service.putFile({ file: file, ...presignedUrl });
            await userService.putProfilePic(presignedUrl.key);

            toast.success(t("photoUpdated"));
        } catch (e) {
            toast.error(tErrors("generic.tryAgainSoon"));
            Sentry.captureException(e);
        }

        await refetchUser();
    };

    const handleBasicInfoSubmit = async (pl: BasicInfo) => {
        await userService.patchBasicInfo(pl);
        await refetch();

        // the basic info feeds the matching, so every cached vacancy is out of
        // date now (score / for_you ordering). The lists are not mounted here,
        // so this only marks them stale — they refetch when the user opens them
        queryClient.invalidateQueries({ queryKey: queryKeys.defaultJobs });
        queryClient.invalidateQueries({ queryKey: queryKeys.userJobs });
        queryClient.invalidateQueries({ queryKey: queryKeys.job });

        toast.success(t("changesSaved"));
        setShowEditBasicInfoForm(false);
    };

    const getCompletness = () => {
        const oneStepValue = 25;
        let data = [
            {
                label: t("completeness.basicInformation"),
                completed: true,
                link: "",
            },
            {
                label: t("completeness.workExperience"),
                completed: !!user?.experience && user.experience.length > 0,
                link: "/profile/experience",
            },
            {
                label: t("completeness.cv"),
                completed: !!user?.documents && !!user.documents.find((i) => i.type === "cv"),
                link: "/profile/documents",
            },
            {
                label: t("completeness.coverLetter"),
                completed:
                    (!!user?.documents && !!user.documents.find((i) => i.type === "cover_letter")) ||
                    !!user?.coverLetter,
                link: "/profile/documents",
            },
        ];
        data = data.sort((a, b) => Number(b.completed) - Number(a.completed));
        const percentage = data.reduce((p, c) => (c.completed ? p + oneStepValue : p), 0);

        return { data, percentage };
    };

    const uiOpportunityTypes = basicInfo?.opportunityTypes
        ?.map((i) => optionLabel("onboarding.opportunityTypes", i))
        .join(", ");
    const uiSectors = basicInfo?.sectors?.map((i) => optionLabel("onboarding.sectors", i)).join(", ");
    const uiProfessionalAreas = basicInfo?.professionalAreas
        ?.map((i) => optionLabel("onboarding.professionalAreas", i))
        .join(", ");
    // the old code took the second whitespace-separated token to drop the flag,
    // which truncated every multi-word country ("United Kingdom" -> "United")
    const uiCountry = basicInfo?.basedCountry ? countryLabel(basicInfo.basedCountry, false) : undefined;
    const uiWorkLocationLabel = basicInfo?.workLocationPreference
        ? optionLabel("onboarding.workLocationPreferences", basicInfo.workLocationPreference)
        : undefined;
    const uiWorkLocationPreference =
        uiWorkLocationLabel && basicInfo?.locations?.length ? (
            <>
                {uiWorkLocationLabel}
                <br />
                {formatLocations(basicInfo.locations, regionLabels)}
            </>
        ) : (
            uiWorkLocationLabel
        );

    const data = [
        {
            emoji: "👀",
            label: t("basicInfo.lookingFor"),
            value: uiOpportunityTypes,
        },
        {
            emoji: "🗂️",
            label: t("basicInfo.sectors"),
            value: uiSectors,
        },
        {
            emoji: "💼",
            label: t("basicInfo.professions"),
            value: uiProfessionalAreas,
        },
        {
            emoji: "🌏",
            label: t("basicInfo.basedIn"),
            value: uiCountry,
        },
        {
            emoji: "📍",
            label: t("basicInfo.workLocation"),
            value: uiWorkLocationPreference,
        },
    ];

    const completness = getCompletness();

    return (
        <div className="about-me-screen">
            <div className="about-me-screen__top-block">
                <div className="about-me-screen__main-info">
                    <div
                        className="about-me-screen__profile-pic-container"
                        onClick={() => picInputRef.current?.click()}
                    >
                        {user?.profilePictureUrl ? (
                            <img
                                src={profilePictureUrl}
                                className="about-me-screen__profile-pic"
                                alt={t("profilePhotoAlt")}
                                aria-hidden="true"
                            />
                        ) : (
                            <p className="about-me-screen__alt-pic-str">?</p>
                        )}
                        <input
                            ref={picInputRef}
                            type="file"
                            accept=".jpeg,.jpg,.png,.webp"
                            hidden
                            onChange={handlePicChange}
                        />
                        <div className="about-me-screen__update-profile-pic-label">
                            <span>{t("updatePhoto")}</span>
                        </div>
                    </div>
                    <div className="about-me-screen__name-email-container">
                        <p className="about-me-screen__user-name">{userName}</p>
                        <p className="about-me-screen__email">{email}</p>
                    </div>
                </div>
                <div className="about-me-screen__profile-completness-block">
                    <div className="about-me-screen__left-completness-block">
                        <p className="about-me-screen__completness-str">
                            {/* the label is laid out on two lines; where the
                                break falls depends on the language, so it is
                                part of the translation */}
                            <Trans t={t} i18nKey="completeness.title" components={{ br: <br /> }} />
                        </p>
                        <ProgressCircle progress={completness.percentage} />
                    </div>
                    <div className="about-me-screen__right-completness-block">
                        {completness.data.map((i) =>
                            i.completed ? (
                                <div key={i.label} className="about-me-screen__completness-str-container">
                                    <p className="about-me-screen__completness-str">{i.label}</p>
                                    <img
                                        src={completeIcon}
                                        className="about-me-screen__complete-icon"
                                        alt=""
                                        aria-hidden="true"
                                    />
                                </div>
                            ) : (
                                <Link
                                    key={i.label}
                                    className="about-me-screen__completness-point"
                                    to={i.link}
                                >
                                    <p className="about-me-screen__completness-point-name">{i.label}</p>
                                    <p className="about-me-screen__completness-point-percentage">(+25%)</p>
                                </Link>
                            ),
                        )}
                    </div>
                </div>
            </div>
            <div className="about-me-screen__basic-info-block">
                <button
                    className="about-me-screen__edit-btn"
                    type="button"
                    onClick={() => setShowEditBasicInfoForm(true)}
                >
                    {t("edit")}
                </button>
                <div className="about-me-screen__basic-info-header">
                    <p className="about-me-screen__heading">{t("basicInfo.heading")}</p>
                    <p className="about-me-screen__description">{t("basicInfo.description")}</p>
                    <div className="about-me-screen__info-container">
                        {data.map((i, index) => (
                            <Fragment key={i.label}>
                                <div className="about-me-screen__part">
                                    <div className="about-me-screen__label-container">
                                        <div className="about-me-screen__emoji-container">
                                            <span>{i.emoji}</span>
                                        </div>
                                        <span className="about-me-screen__label">{i.label}</span>
                                    </div>
                                    <p className="about-me-screen__result">{i.value}</p>
                                </div>
                                {index + 1 !== data.length && <hr className="about-me-screen__line" />}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
            {showEditBasicInfoForm && (
                <EditBasicInfoForm
                    defaultValues={basicInfo}
                    ref={editBasicInfoFormRef}
                    isOpen={showEditBasicInfoForm}
                    onSubmit={handleBasicInfoSubmit}
                    onClose={() => setShowEditBasicInfoForm(false)}
                />
            )}
        </div>
    );
}

export default AboutMeScreen;
