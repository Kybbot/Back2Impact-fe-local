import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation, useSearchParams } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "../../../../components/shared/checkbox/checkbox";
import type { FilterGroup } from "../../../../utils/filter-options";
import { SCALE_FILTER_GROUPS, useFilterOptions } from "../../../../i18n/options";
import { useNavigate } from "../../../../i18n/navigation";
import { useT } from "../../../../i18n/use-t";
import { stripLocaleFromPathname } from "../../../../i18n/locale";
import TagsPicker from "../tags-picker/tags-picker";
import FiltersPopover from "../filters-popover/filters-popover";
import searchIcon from "/img/search-icon.svg";
import { useIsLoggedIn } from "../../../../hooks/useCurrentUser";
// import SaveVacancyPopup from "../../../../components/widgets/save-vacancy-popup/save-vacancy-popup";
import { useDebounce } from "../../../../hooks/use-debounce";
import { toggleJob } from "../../../../utils/toggle-job";
import ApplyBlock from "../../../../components/widgets/apply-block/apply-block";
import {
    clearFilterParams,
    readFiltersFromParams,
    readSearchFromParams,
    writeFiltersToParams,
    writeSearchToParams,
} from "../../../../utils/job-filters-url";
import type { JobsOutletContext } from "./jobs-context";
import type { JobFilters, JobListType } from "@/types/jobs";
import { toast } from "react-toastify";
import { useRememberRedirect } from "@/services/job-service";

type ApplyBlockRef = { open: () => void };

type Props = { className?: string };

/** filter changes replace the entry rather than pile up in history */
const REPLACE = { replace: true, preventScrollReset: true } as const;

/**
 * One checkbox filter group. The options come back already labelled and sorted
 * for the active language — the headings advertise "A-Z", and alphabetical
 * order is not the same in Ukrainian as in English. Scales such as seniority
 * keep their own order and drop the hint.
 */
function CheckboxFilter({
    group,
    selected,
    borderless = false,
    onToggle,
}: {
    group: Extract<FilterGroup, "professionalAreas" | "workFormats" | "employmentTypes" | "seniorityLevels">;
    selected: string[];
    borderless?: boolean;
    onToggle: (value: string) => void;
}) {
    const { t } = useT("jobs");
    const options = useFilterOptions(group);

    return (
        <div className={`jobs-block__filter ${borderless ? "jobs-block__filter_borderless" : ""}`}>
            <p className="jobs-block__filter-heading">
                <span>{t(`filters.headings.${group}`)}</span>
                {!SCALE_FILTER_GROUPS.has(group) && (
                    <span className="jobs-block__filter-heading-addition">{t("filters.sortHint")}</span>
                )}
            </p>
            <div className="jobs-block__filter-options-block">
                {options.map(({ code, label }) => (
                    <div key={code} className="jobs-block__filter-option">
                        <Checkbox
                            label={label}
                            checked={selected.includes(code)}
                            onChange={() => onToggle(code)}
                            className="jobs-block__filter-checkbox"
                            labelClass="jobs-block__filter-option-str"
                            controlClassName="jobs-block__filter-checkbox-control"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function JobsBlock({ className }: Props) {
    const { t } = useT("jobs");
    const spheres = useFilterOptions("spheres");
    const isLoggedIn = useIsLoggedIn();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const rememberRedirect = useRememberRedirect();

    // the query string is the source of truth: a filtered feed then survives a
    // refresh, a shared link, and the round trip through a vacancy page
    const filters = useMemo(() => readFiltersFromParams(searchParams), [searchParams]);

    // the input itself stays local — the URL is written from the debounced
    // value, not from every keystroke
    const [searchString, setSearchString] = useState(() => readSearchFromParams(searchParams));
    const debouncedSearch = useDebounce(searchString, 300);
    // an empty input applies right away, so a reset doesn't lag 300ms behind
    const searchQuery = searchString === "" ? "" : debouncedSearch;
    // const [showSavePopup, setShowSavePopup] = useState(false);
    const [applyingJob, setApplyingJob] = useState<JobListType | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const applyBlockRef = useRef<ApplyBlockRef>(null);

    // the locale prefix is stripped: switching language navigates to the same
    // feed's twin URL and must keep what the visitor filtered by
    const feed = stripLocaleFromPathname(location.pathname);
    const [currentFeed, setCurrentFeed] = useState(feed);

    // reset the search box before the new feed renders, otherwise it fetches
    // once with the previous one. The filters need no reset: they are read from
    // the query string, and every feed tab links to a bare path
    if (currentFeed !== feed) {
        setCurrentFeed(feed);
        setSearchString("");
    }

    // the debounced value is what reaches the URL — one entry per pause in
    // typing rather than one per keystroke
    useEffect(() => {
        if (readSearchFromParams(searchParams) === searchQuery) return;

        setSearchParams(writeSearchToParams(searchParams, searchQuery), REPLACE);
    }, [searchQuery, searchParams, setSearchParams]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (applyingJob) applyBlockRef.current?.open();
    }, [applyingJob]);

    const navigateToSignUp = () => {
        rememberRedirect.mutate(
            { path: location.pathname },
            { onSettled: () => navigate("/auth?tab=sign-up") },
        );
    };

    const toggleFilter = <K extends keyof JobFilters>(filter: K, value: JobFilters[K][number]) => {
        const exists = filters[filter].includes(value);

        const next = {
            ...filters,
            [filter]: exists ? filters[filter].filter((v) => v !== value) : [...filters[filter], value],
        };

        setSearchParams(writeFiltersToParams(searchParams, next), REPLACE);
    };

    const clearFilters = () => {
        setSearchString("");
        setSearchParams(clearFilterParams(searchParams), REPLACE);
    };

    const handleApplyClick = async (job: JobListType) => {
        if (isLoggedIn) {
            setApplyingJob(job);
        } else navigateToSignUp();
    };

    const handleApplySubmit = async () => {
        if (!applyingJob) return;

        toggleJob({
            jobId: applyingJob.id,
            field: "isApplied",
            filters,
            searchString: searchQuery,
            queryClient,
        });
    };

    const handleApplyClose = (isSuccess: boolean) => {
        setApplyingJob(null);

        if (isSuccess) toast.success(t("apply.sent"));
    };

    // a guest on the "for you" feed gets the sign-up screen, not a list —
    // there is nothing for the search and filters to narrow down
    const showFilters = isLoggedIn || feed !== "/jobs/for-you";

    const activeFiltersCount = Object.keys(filters).reduce(
        (prev, curr) => prev + filters[curr as keyof JobFilters].length,
        0,
    );

    // shared by the sidebar (from 1024px) and the popover (below it)
    const filtersContent = (
        <>
            {activeFiltersCount > 0 && (
                <div className="jobs-block__selected-filters-count-block">
                    <p className="jobs-block__selected-filters-count">
                        {t("filters.selectedCount", { count: activeFiltersCount })}
                    </p>
                    <button className="jobs-block__clear-filters-btn" type="button" onClick={clearFilters}>
                        {t("filters.clearAll")}
                    </button>
                </div>
            )}
            <CheckboxFilter
                group="professionalAreas"
                selected={filters.professionalAreas}
                onToggle={(value) => toggleFilter("professionalAreas", value)}
            />
            <div className="jobs-block__filter">
                <p className="jobs-block__filter-heading">
                    <span>{t("filters.headings.spheres")}</span>
                    <span className="jobs-block__filter-heading-addition">{t("filters.sortHint")}</span>
                </p>
                <TagsPicker
                    options={spheres}
                    value={filters.spheres}
                    onChange={(value) => toggleFilter("spheres", value)}
                />
            </div>
            <CheckboxFilter
                group="workFormats"
                selected={filters.workFormats}
                onToggle={(value) => toggleFilter("workFormats", value)}
            />
            <CheckboxFilter
                group="employmentTypes"
                selected={filters.employmentTypes}
                onToggle={(value) => toggleFilter("employmentTypes", value)}
            />
            <CheckboxFilter
                borderless
                group="seniorityLevels"
                selected={filters.seniorityLevels}
                onToggle={(value) => toggleFilter("seniorityLevels", value)}
            />
        </>
    );

    return (
        <div className={`jobs-block ${className ?? ""}`}>
            <div className="jobs-block__main">
                <Outlet
                    context={
                        {
                            filters,
                            searchString: searchQuery,
                            onApplyClick: handleApplyClick,
                            onClearFiltersClick: clearFilters,
                        } satisfies JobsOutletContext
                    }
                />
            </div>
            {showFilters && (
                <div className="jobs-block__filter-block">
                    <div className="jobs-block__search-row">
                        <div className="jobs-block__search-block">
                            <img
                                src={searchIcon}
                                className="jobs-block__search-icon"
                                alt={t("filters.searchAlt")}
                                aria-hidden="true"
                            />
                            <input
                                type="text"
                                placeholder={t("filters.searchPlaceholder")}
                                value={searchString}
                                onChange={(e) => setSearchString(e.target.value)}
                                className="jobs-block__search-input"
                            />
                        </div>
                        <FiltersPopover activeCount={activeFiltersCount}>{filtersContent}</FiltersPopover>
                    </div>
                    <div className="jobs-block__filter-block-main">{filtersContent}</div>
                </div>
            )}
            {/* {showSavePopup && (
                <SaveVacancyPopup
                    onClick={() => navigate("/auth?tab=sign-up")}
                    onBackgroundClick={() => setShowSavePopup(false)}
                />
            )} */}
            {applyingJob && (
                <ApplyBlock
                    ref={applyBlockRef}
                    applyingJob={applyingJob}
                    onSubmit={handleApplySubmit}
                    onClose={handleApplyClose}
                />
            )}
        </div>
    );
}

export default JobsBlock;
