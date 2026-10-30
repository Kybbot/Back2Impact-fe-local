import { useRef, type MouseEvent } from "react";
import { useLocation, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import levelIcon from "/img/level-icon.svg";
import clockIcon from "/img/clock-icon.svg";
import checkMarkIcon from "/img/check-mark.svg";
import buildingIcon from "/img/building-icon.svg";
import rightTopArrow from "/img/right-top-arrow.svg";
import filledBookmarkIcon from "/img/filled-bookmark.svg";

import { useT } from "../../i18n/use-t";
import { useOptionLabel } from "../../i18n/options";
import { useLocalized } from "../../i18n/pick-localized";
import { Link, useNavigate } from "../../i18n/navigation";

import SkeletonJobBlock from "./components/skeleton-job-block/skeleton-job-block";

import ApplyBlock from "../../components/widgets/apply-block/apply-block";
// import SaveVacancyPopup from "../../components/widgets/save-vacancy-popup/save-vacancy-popup";

import { jobQueryKey, useJob } from "../../hooks/use-job";
import { useIsLoggedIn } from "../../hooks/useCurrentUser";

import { useRememberRedirect, useSaveJob, useUnsaveJob } from "@/services/job-service";

import { withLineBreaks } from "@/utils/html";
import { useFormatShortDate } from "@/utils/date";
import { CURRENCY_KEYS } from "@/utils/job-currency";
import { useFormatRelativeDate } from "../../utils/format-relative-date";

import type { GetOneJobType } from "@/types/jobs";
import { toast } from "react-toastify";

type ApplyBlockRef = {
    open: () => void;
};

type Props = {
    className?: string;
    /**
     * Server-rendered vacancy, already carrying the visitor's
     * score / isSaved / isApplied / applyStatus when they are signed in.
     */
    initialJob?: GetOneJobType | null;
};

function JobBlock({ className, initialJob }: Props) {
    const { t } = useT("job");
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const localized = useLocalized();
    const isLoggedIn = useIsLoggedIn();
    const queryClient = useQueryClient();
    const optionLabel = useOptionLabel();
    const formatShortDate = useFormatShortDate();
    const formatRelativeDate = useFormatRelativeDate();

    const { data: job } = useJob(id, initialJob);

    const saveJob = useSaveJob();
    const unsaveJob = useUnsaveJob();
    const rememberRedirect = useRememberRedirect();

    // const [showSavePopup, setShowSavePopup] = useState(false);
    const applyBlockRef = useRef<ApplyBlockRef>(null);

    if (!id) return null;

    if (!job) return <SkeletonJobBlock />;

    const isSaveTogglePending = saveJob.isPending || unsaveJob.isPending;

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
    const uiOpportunityTypes = (job.opportunityTypes ?? [])
        .map((type) => optionLabel("opportunityTypes", type))
        .join(", ");
    const uiWorkFormat = optionLabel("filters.workFormats", job.format);
    const jobName = localized(job, "name");
    const companyDescription = localized(job, "companyDescription");

    const seniorityLabel = (from: string, to: string) => {
        const fromLabel = optionLabel("filters.seniorityLevels", from);

        if (!to || from === to) return fromLabel;

        return t("seniorityRange", {
            from: fromLabel,
            to: optionLabel("filters.seniorityLevels", to),
        });
    };

    const uiSeniorityLevel = seniorityLabel(job.seniorityFrom, job.seniorityTo);

    const getSalaryLabel = () => {
        const { minimumSalary: min, maximumSalary: max, currency } = job;

        if (currency === "Unpaid") return t(`currency.${CURRENCY_KEYS[currency]}`);

        if (!min && !max) return null;

        const amount = t("salary", {
            context: min && max ? "range" : max ? "max" : undefined,
            min,
            max,
        });

        if (!currency) return amount;

        return `${amount} ${t(`currency.${CURRENCY_KEYS[currency]}`)}`;
    };

    const uiSalary = getSalaryLabel();

    const getLanguageLabels = () => {
        const { englishLevel, ukrainianLevel } = job;
        const levels: string[] = [];

        if (englishLevel && englishLevel !== "Not required")
            levels.push(t("languages.english", { level: englishLevel }));

        if (ukrainianLevel && ukrainianLevel !== "Not required")
            levels.push(t("languages.ukrainian", { level: ukrainianLevel }));

        return levels;
    };

    const uiLanguages = getLanguageLabels();

    const getInternshipLabel = () => {
        const { internshipStart, internshipEnd, internshipSeason } = job;

        const start = internshipStart ? formatShortDate(internshipStart) : undefined;
        const end = internshipEnd ? formatShortDate(internshipEnd) : undefined;

        const dates =
            (start || end) &&
            t("internshipDates", {
                context: start && end ? undefined : start ? "from" : "until",
                start,
                end,
            });

        return [dates, internshipSeason].filter(Boolean).join(" · ");
    };

    const uiInternship = getInternshipLabel();

    const getApplyBtnText = () => {
        if (!job.isApplied) return t("apply");

        if (job.applyStatus && job.applyStatus !== "new" && job.applyStatus !== "in_review")
            return t("appliedWithStatus", { status: t(`applyStatus.${job.applyStatus}`) });

        return t("applied");
    };

    const navigateToSignUp = () => {
        rememberRedirect.mutate(
            { path: location.pathname },
            { onSettled: () => navigate("/auth?tab=sign-up") },
        );
    };

    const patchJob = (patch: Partial<GetOneJobType>) => {
        queryClient.setQueryData<GetOneJobType>(jobQueryKey(id), (p) => p && { ...p, ...patch });
    };

    const handleSaveClick = () => {
        if (!isLoggedIn) {
            navigateToSignUp();
            return;
        }

        const toggleSave = job.isSaved ? unsaveJob : saveJob;

        toggleSave.mutate(
            { jobId: job.id },
            {
                onSuccess: () => {
                    patchJob({ isSaved: !job.isSaved });
                    toast.success(t(job.isSaved ? "unsaved" : "saved"));
                },
            },
        );
    };

    const handleApplyClick = async () => {
        if (isLoggedIn) applyBlockRef.current?.open();
        else navigateToSignUp();
    };

    const handleApplySubmit = async () => {
        patchJob({ isApplied: true });
    };

    const handleApplyClose = (isSuccess: boolean) => {
        if (isSuccess) toast.success(t("applicationSent"));
    };

    const handleBackClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // React Router's own history index: 0 on every fresh page load (new tab, search
        // result, shared link) and only bumped by in-app pushes, so > 0 means the entry
        // behind this one is ours. `location.key` is not enough — a replace navigation
        // gives the entry page a key too, and Back then leaves the site.
        const hasInAppHistory = (window.history.state?.idx ?? 0) > 0;

        if (!hasInAppHistory || e.metaKey || e.ctrlKey || e.shiftKey) return;

        e.preventDefault();
        navigate(-1);
    };

    const renderFooter = (modifier: "mobile" | "desktop") => (
        <div className={`job-block__footer job-block__footer_${modifier}`}>
            {/* relative to Date.now(), so the server and the hydrating
            client disagree for freshly posted vacancies */}
            <p className="job-block__published-str" suppressHydrationWarning>
                {t("published", { date: formattedDate })}
            </p>
            <button
                className="job-block__apply-btn"
                type="button"
                disabled={job.isApplied}
                onClick={handleApplyClick}
            >
                {job.isApplied && <img src={checkMarkIcon} alt="" aria-hidden="true" />}
                <span>{getApplyBtnText()}</span>
            </button>
        </div>
    );

    return (
        <div className={`job-block ${className ?? ""}`}>
            <Link to="/jobs/all" className="job-block__back" onClick={handleBackClick}>
                <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill="#333333"
                        fillOpacity="0.4"
                        d="M5.53151 7.80078L9.53151 11.8008L10.4648 10.8674L7.39818 7.80078L10.4648 4.73411L9.53151 3.80078L5.53151 7.80078Z"
                    />
                </svg>
                {t("backToListings")}
            </Link>
            <div className="job-block__wrapper">
                <div className="job-block__main">
                    {/* matches the BreadcrumbList JSON-LD in app/routes/job.tsx and gives
                the vacancy page a crawlable link back up to the listing */}
                    <nav className="job-block__breadcrumbs" aria-label={t("breadcrumbs.label")}>
                        <Link className="job-block__breadcrumbs-link" to="/">
                            Back2Impact
                        </Link>
                        <span aria-hidden="true">/</span>
                        <Link className="job-block__breadcrumbs-link" to="/jobs/all">
                            {t("breadcrumbs.allVacancies")}
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{jobName}</span>
                    </nav>
                    <div className="job-block__top-block">
                        <div className="job-block__header">
                            {isLoggedIn && (job.score ?? 0) > 0 && (
                                <div className="job-block__match-block">
                                    <div
                                        className={`job-block__match-indicator job-block__match-indicator_${indicatorColor}`}
                                    ></div>
                                    <div className="job-block__match-info">
                                        <p className="job-block__match-level">{job.score}%</p>
                                        <p className="job-block__match-str">{t("match")}</p>
                                    </div>
                                </div>
                            )}
                            <div className="job-block__save-btn-container">
                                <button
                                    type="button"
                                    onClick={handleSaveClick}
                                    className="job-block__save-btn"
                                    disabled={isSaveTogglePending || rememberRedirect.isPending}
                                >
                                    {job.isSaved ? (
                                        <img src={filledBookmarkIcon} alt="" aria-hidden="true" />
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
                        <div className="job-block__main-info-block">
                            <h1 className="job-block__job-name">{jobName}</h1>
                            {uiSalary && <p className="job-block__salary-str">{uiSalary}</p>}
                        </div>
                        <div className="job-block__tags">
                            {uiLanguages.length > 0 && (
                                <div className="job-block__tagsRow">
                                    {uiLanguages.map((language) => (
                                        <div key={language} className="job-block__tag">
                                            <p className="job-block__tag-str">{language}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="job-block__tagsRow">
                                {uiOpportunityTypes && (
                                    <div className="job-block__tag">
                                        <img
                                            src={clockIcon}
                                            className="job-block__tag-icon"
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <p className="job-block__tag-str">{uiOpportunityTypes}</p>
                                    </div>
                                )}
                                <div className="job-block__tag">
                                    <img
                                        src={buildingIcon}
                                        className="job-block__tag-icon"
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <p className="job-block__tag-str">{uiWorkFormat}</p>
                                </div>
                                <div className="job-block__tag">
                                    <img
                                        src={levelIcon}
                                        className="job-block__tag-icon"
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <p className="job-block__tag-str">{uiSeniorityLevel}</p>
                                </div>
                            </div>
                        </div>
                        {uiInternship && (
                            <div className="job-block__internship">
                                <p className="job-block__internship-label">{t("internship")}</p>
                                <p className="job-block__internship-str">{uiInternship}</p>
                            </div>
                        )}
                    </div>
                    {renderFooter("mobile")}
                    <div className="job-block__description-block">
                        <div
                            className="job-block__description"
                            dangerouslySetInnerHTML={{
                                __html: withLineBreaks(localized(job, "description")),
                            }}
                        />
                    </div>
                </div>
                <div className="job-block__company-block">
                    <div className="job-block__company-header">
                        <div className="job-block__company-logo-name-container">
                            {job.companyLogoUrl && (
                                <div className="job-block__company-logo-container">
                                    <img
                                        className="job-block__company-logo"
                                        src={job.companyLogoUrl}
                                        alt={t("companyLogoAlt", { company: job.companyName })}
                                        decoding="async"
                                    />
                                </div>
                            )}
                            <p className="job-block__company-name">{job.companyName}</p>
                        </div>
                        <a
                            className="job-block__company-website-link"
                            href={job.companyWebsite}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                        >
                            <span>{t("openCompanyWebsite")}</span>
                            <img src={rightTopArrow} alt="" aria-hidden="true" />
                        </a>
                    </div>

                    {(!!job.companySize || !!job.companyHeadquartes) && (
                        <div className="job-block__company-additional-info">
                            {job.companySize && (
                                <p className="job-block__company-additional-str">
                                    {t("employees", {
                                        count: Number(job.companySize) || 0,
                                        size: job.companySize,
                                    })}
                                </p>
                            )}
                            {job.companyHeadquartes && (
                                <p className="job-block__company-additional-str">{job.companyHeadquartes}</p>
                            )}
                        </div>
                    )}

                    <p className="job-block__company-description">{companyDescription}</p>

                    {renderFooter("desktop")}
                </div>
            </div>
            <ApplyBlock
                ref={applyBlockRef}
                applyingJob={job}
                onClose={handleApplyClose}
                onSubmit={handleApplySubmit}
            />
            {/* {showSavePopup && (
                <SaveVacancyPopup
                    onClick={navigateToSignUp}
                    onBackgroundClick={() => setShowSavePopup(false)}
                />
            )} */}
        </div>
    );
}

export default JobBlock;
