import clockIcon from "/img/clock-icon.svg";
import buildingIcon from "/img/building-icon.svg";
import levelIcon from "/img/level-icon.svg";
import filledBookmarkIcon from "/img/filled-bookmark.svg";
import checkMarkIcon from "/img/check-mark.svg";
import { useFormatRelativeDate } from "../../../../utils/format-relative-date";
import { type MouseEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link, useNavigate } from "../../../../i18n/navigation";
import { useOptionLabel } from "../../../../i18n/options";
import { useLocalized } from "../../../../i18n/pick-localized";
import { useT } from "../../../../i18n/use-t";
import { toggleJob } from "../../../../utils/toggle-job";
import { useRememberRedirect, useSaveJob, useUnsaveJob } from "@/services/job-service";
import { useJobsContext } from "../jobs-block/jobs-context";
import { CURRENCY_KEYS } from "@/utils/job-currency";
import type { JobListType } from "@/types/jobs";

type Props = {
    className?: string;
    job: JobListType;
    type: "default" | "saved" | "applied";
    isAuthorized: boolean;
    onApplyClick: (job: JobListType) => void;
};

function Job({ className, job, isAuthorized, onApplyClick }: Props) {
    const { t } = useT("jobs");
    const navigate = useNavigate();
    const localized = useLocalized();
    const queryClient = useQueryClient();
    const optionLabel = useOptionLabel();
    const formatRelativeDate = useFormatRelativeDate();

    const { filters, searchString } = useJobsContext();

    const rememberRedirect = useRememberRedirect();
    const { mutate: saveJob, isPending: isSaveJobPending } = useSaveJob();
    const { mutate: unsaveJob, isPending: isUnsaveJobPending } = useUnsaveJob();

    const isSaveTogglePending = isSaveJobPending || isUnsaveJobPending;

    const navigateToSignUp = () => {
        rememberRedirect.mutate(
            { path: location.pathname },
            { onSettled: () => navigate("/auth?tab=sign-up") },
        );
    };

    const onToggleSuccess = () => {
        toggleJob({ jobId: job.id, field: "isSaved", filters, searchString, queryClient });
        toast.success(t(job.isSaved ? "card.unsaved" : "card.saved"));
    };

    const handleCardClick = () => {
        navigate(`/jobs/j/${job.id}`);
    };

    const handleSaveClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (job.isSaved) unsaveJob({ jobId: job.id }, { onSuccess: onToggleSuccess });
        else if (isAuthorized) saveJob({ jobId: job.id }, { onSuccess: onToggleSuccess });
        else navigateToSignUp();
    };

    const handleApplyClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onApplyClick(job);
    };

    /**
     * The whole card is clickable, but only this anchor exists in the HTML —
     * it is how a crawler reaches /jobs/j/:id at all. `stopPropagation` keeps
     * the click from also reaching the card's own handler, which would push a
     * second, identical history entry. React Router's Link calls this before
     * it navigates, so the navigation itself still happens.
     */
    const handleNameClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
    };

    const getApplyBtnText = () => {
        if (!job.isApplied) return t("card.apply");

        if (job.applyStatus && job.applyStatus !== "new" && job.applyStatus !== "in_review")
            return t("card.appliedWithStatus", { status: t(`applyStatus.${job.applyStatus}`) });

        return t("card.applied");
    };

    const seniorityLabel = (from: string, to: string) => {
        const fromLabel = optionLabel("filters.seniorityLevels", from);

        if (!to || from === to) return fromLabel;

        return t("card.seniorityRange", {
            from: fromLabel,
            to: optionLabel("filters.seniorityLevels", to),
        });
    };

    const getSalaryLabel = () => {
        const { minimumSalary: min, maximumSalary: max, currency } = job;

        if (currency === "Unpaid") return t(`card.currency.${CURRENCY_KEYS[currency]}`);

        if (!min && !max) return null;

        const amount = t("card.salary", {
            context: min && max ? "range" : max ? "max" : undefined,
            min,
            max,
        });

        if (!currency) return amount;

        return `${amount} ${t(`card.currency.${CURRENCY_KEYS[currency]}`)}`;
    };

    const getLanguageLabels = () => {
        const { englishLevel, ukrainianLevel } = job;
        const levels: string[] = [];

        if (englishLevel && englishLevel !== "Not required")
            levels.push(t("card.languages.english", { level: englishLevel }));

        if (ukrainianLevel && ukrainianLevel !== "Not required")
            levels.push(t("card.languages.ukrainian", { level: ukrainianLevel }));

        return levels;
    };

    const indicatorColor = job.score
        ? job.score <= 33
            ? "red"
            : job.score <= 66
              ? "yellow"
              : job.score <= 99
                ? "green"
                : "dark-green"
        : "grey";

    const date = new Date(job.createdAt);
    const formattedDate = formatRelativeDate(date);
    const applyBtnText = getApplyBtnText();
    const uiOpportunityTypes = (job.opportunityTypes ?? [])
        .map((type) => optionLabel("opportunityTypes", type))
        .join(", ");
    const uiWorkFormat = optionLabel("filters.workFormats", job.format);
    const uiSeniorityLevel = seniorityLabel(job.seniorityFrom, job.seniorityTo);
    const uiSalary = getSalaryLabel();
    const uiLanguages = getLanguageLabels();

    return (
        <article className={`job ${className}`} onClick={handleCardClick}>
            <div className="job__header">
                {isAuthorized && (job.score ?? 0) > 0 && (
                    <div className="job__match-block">
                        <div className={`job__match-indicator job__match-indicator_${indicatorColor}`}></div>
                        <div className="job__match-info">
                            <p className="job__match-level">{job.score}%</p>
                            <p className="job__match-str">{t("card.match")}</p>
                        </div>
                    </div>
                )}
                <div className="job__save-btn-container">
                    <button
                        type="button"
                        className="job__save-btn"
                        onClick={handleSaveClick}
                        disabled={isSaveTogglePending || rememberRedirect.isPending}
                    >
                        {job.isSaved ? (
                            <img src={filledBookmarkIcon} alt="" />
                        ) : (
                            <svg
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clipPath="url(#clip0_611_3035)">
                                    <rect width="24" height="24" />
                                    <path
                                        d="M18 8.5V21L12 17L6 21V8.5C6 7.43913 6.42143 6.42172 7.17157 5.67157C7.92172 4.92143 8.93913 4.5 10 4.5H14C15.0609 4.5 16.0783 4.92143 16.8284 5.67157C17.5786 6.42172 18 7.43913 18 8.5Z"
                                        strokeWidth="1.8"
                                        stroke="#3333334D"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_611_3035">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className="job__main-info">
                <h2 className="job__job-name">
                    <Link
                        className="job__job-name-link"
                        to={`/jobs/j/${job.id}`}
                        prefetch="intent"
                        onClick={handleNameClick}
                    >
                        {localized(job, "name")}
                    </Link>
                </h2>
                <div className="job__company-block">
                    {job.companyLogoUrl && (
                        <div className="job__company-logo-container">
                            <img
                                src={job.companyLogoUrl}
                                className="job__company-logo"
                                alt={t("card.companyLogoAlt", { company: job.companyName })}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    )}
                    <div className="job__company-name">{job.companyName}</div>
                </div>
            </div>
            {uiSalary && (
                <div className="job__salary-block">
                    <p className="job__salary-str">{uiSalary}</p>
                </div>
            )}
            <div className="job__tags">
                {uiLanguages.length > 0 && (
                    <div className="job__tagsRow">
                        {uiLanguages.map((language) => (
                            <div key={language} className="job__tag">
                                <p className="job__tag-str">{language}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="job__tagsRow">
                    {uiOpportunityTypes && (
                        <div className="job__tag">
                            <img src={clockIcon} className="job__tag-icon" alt="" aria-hidden="true" />
                            <p className="job__tag-str">{uiOpportunityTypes}</p>
                        </div>
                    )}
                    <div className="job__tag">
                        <img src={buildingIcon} className="job__tag-icon" alt="" aria-hidden="true" />
                        <p className="job__tag-str">{uiWorkFormat}</p>
                    </div>
                    <div className="job__tag">
                        <img src={levelIcon} className="job__tag-icon" alt="" aria-hidden="true" />
                        <p className="job__tag-str">{uiSeniorityLevel}</p>
                    </div>
                </div>
            </div>
            <div className="job__footer">
                {/* relative to Date.now(), so the server and the hydrating
                client disagree for freshly posted vacancies */}
                <p className="job__published-str" suppressHydrationWarning>
                    {t("card.published", { date: formattedDate })}
                </p>
                <button
                    className="job__apply-btn"
                    type="button"
                    disabled={!!job?.isApplied}
                    onClick={handleApplyClick}
                >
                    {job.isApplied && <img src={checkMarkIcon} alt="" aria-hidden="true" />}
                    <span>{applyBtnText}</span>
                </button>
            </div>
        </article>
    );
}

export default Job;
