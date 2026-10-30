import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import CandidatesTable from "./candidates-table";
import CandidateDialog from "./candidate-dialog";

import { useT } from "@/i18n/use-t";

import Pagination from "@/components/shared/pagination/pagination";
import ErrorBlock from "@/components/shared/error-block/error-block";
import LoaderBlock from "@/components/shared/loader-block/loader-block";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";

import { useDebounce } from "@/hooks/use-debounce";

import {
    EMPLOYER_APPLICATION_STATUSES,
    type EmployerApplicationType,
    type EmployerApplicationStatus,
} from "@/services/employer-service/types";
import { useEmployerApplications } from "@/services/employer-service";

import searchIcon from "/img/search-icon.svg";

const PAGE_SIZE = 10;

/** a select item can't have an empty value, so "every status" gets a name of its own */
const ALL_STATUSES = "all";

type Filters = {
    page: number;
    search: string;
    status: EmployerApplicationStatus | null;
};

/** `?page=` as a whole page number, anything else is the first page */
const parsePage = (value: string | null) => {
    const page = Number(value);

    return Number.isInteger(page) && page > 1 ? page : 1;
};

/** it goes straight into the request, so a hand-edited `?status=` this build doesn't know is dropped */
const parseStatus = (value: string | null) =>
    EMPLOYER_APPLICATION_STATUSES.find((status) => status === value) ?? null;

/** the defaults stay out of the url, so the unfiltered first page has one */
const toSearchParams = ({ page, search, status }: Filters): Record<string, string> => ({
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(page > 1 ? { page: String(page) } : {}),
});

function EmployerCandidates() {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");

    // the query string is the source of truth, so a filtered list survives a refresh
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parsePage(searchParams.get("page"));
    const search = searchParams.get("search") ?? "";
    const status = parseStatus(searchParams.get("status"));

    // the input itself stays local — the url is written from the debounced value
    const [searchInput, setSearchInput] = useState(search);
    const debouncedSearch = useDebounce(searchInput, 300);
    // an emptied input applies right away, so a reset doesn't lag behind
    const searchQuery = searchInput === "" ? "" : debouncedSearch;

    const { data, isPending, isError, isPlaceholderData } = useEmployerApplications({
        page,
        pageSize: PAGE_SIZE,
        searchString: search.trim() || undefined,
        status: status ?? undefined,
    });

    /** the application open in the dialog, `null` while it's closed */
    const [opened, setOpened] = useState<EmployerApplicationType | null>(null);

    // past the end — a stale link, or the last candidate of the last page filtered away: show the last page there is
    const lastPage = !data || isPlaceholderData ? null : Math.max(data.totalPages, 1);
    const isFiltered = !!search || !!status;

    // a new filter numbers a new list, so it starts from its first page
    const handleStatusChange = (value: string) =>
        setSearchParams(toSearchParams({ page: 1, search, status: parseStatus(value) }));

    const renderContent = () => {
        if (isPending) return <LoaderBlock className="loader-block--blue employer-candidates__loader" />;
        if (isError) return <ErrorBlock message={tErrors("generic.reload")} />;

        if (data.total === 0)
            return (
                <div className="employer-candidates__empty">
                    <span className="employer-candidates__empty-emoji" aria-hidden="true">
                        {isFiltered ? "🔍" : "👥"}
                    </span>
                    <div className="employer-candidates__empty-text">
                        <h2 className="employer-candidates__empty-heading">
                            {t(isFiltered ? "candidates.notFound.heading" : "candidates.empty.heading")}
                        </h2>
                        <p className="employer-candidates__muted">
                            {t(
                                isFiltered
                                    ? "candidates.notFound.description"
                                    : "candidates.empty.description",
                            )}
                        </p>
                    </div>
                </div>
            );

        return (
            <>
                <CandidatesTable applications={data.data} isStale={isPlaceholderData} onView={setOpened} />
                <Pagination
                    page={page}
                    totalPages={data.totalPages}
                    onChange={(next) => setSearchParams(toSearchParams({ page: next, search, status }))}
                />
            </>
        );
    };

    // the debounced value is what reaches the url — one entry per pause in
    // typing rather than one per keystroke
    useEffect(() => {
        if (searchQuery === search) return;

        setSearchParams(toSearchParams({ page: 1, search: searchQuery, status }), { replace: true });
    }, [searchQuery, search, status, setSearchParams]);

    useEffect(() => {
        if (lastPage !== null && page > lastPage)
            setSearchParams(toSearchParams({ page: lastPage, search, status }), { replace: true });
    }, [lastPage, page, search, status, setSearchParams]);

    return (
        <div className="employer-candidates">
            <section className="employer-candidates__card employer-candidates__header">
                <div className="employer-candidates__emoji-container" aria-hidden="true">
                    <span>👥</span>
                </div>
                <div className="employer-candidates__header-text">
                    <h1 className="employer-candidates__heading">{t("candidates.heading")}</h1>
                    <p className="employer-candidates__muted">{t("candidates.description")}</p>
                </div>
            </section>

            <section className="employer-candidates__card employer-candidates__list">
                <div className="employer-candidates__filters">
                    <div className="employer-candidates__search">
                        <label htmlFor="candidatesSearchId" className="visually-hidden">
                            {t("candidates.filters.search")}
                        </label>
                        <img
                            alt=""
                            src={searchIcon}
                            aria-hidden="true"
                            className="employer-candidates__search-icon"
                        />
                        <input
                            type="search"
                            value={searchInput}
                            id="candidatesSearchId"
                            className="employer-candidates__search-input"
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={t("candidates.filters.searchPlaceholder")}
                        />
                    </div>
                    <CustomSelect
                        hideLabel
                        id="candidatesStatusId"
                        value={status ?? ALL_STATUSES}
                        label={t("candidates.filters.status")}
                        className="employer-candidates__select"
                        onValueChange={handleStatusChange}
                    >
                        <CustomSelectItem value={ALL_STATUSES}>
                            {t("candidates.filters.allStatuses")}
                        </CustomSelectItem>
                        {EMPLOYER_APPLICATION_STATUSES.map((item) => (
                            <CustomSelectItem key={item} value={item}>
                                {t(`candidates.status.${item}`)}
                            </CustomSelectItem>
                        ))}
                    </CustomSelect>
                </div>

                {renderContent()}
            </section>

            {opened && <CandidateDialog application={opened} onClose={() => setOpened(null)} />}
        </div>
    );
}

export default EmployerCandidates;
