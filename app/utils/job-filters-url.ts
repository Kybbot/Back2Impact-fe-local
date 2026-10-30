import type { JobFilters } from "@/types/jobs";
import { type FilterGroup, filterOptions } from "./filter-options";

/**
 * The vacancy filters live in the query string: `?workFormats=remote,hybrid&q=react`.
 *
 * That is what makes a filtered feed survive a refresh and be worth sharing —
 * the state belongs to the URL, not to a component that unmounts the moment a
 * vacancy is opened.
 */

/** the free-text search, kept short because it is the one a human types over */
const SEARCH_PARAM = "q";

/** `/jobs/all?page=N` — pagination, owned by the route loader, not by us */
const PAGE_PARAM = "page";

const GROUPS = Object.keys(filterOptions) as FilterGroup[];

/**
 * Codes are comma-joined: none of them contains a comma, and a repeated key per
 * value makes the URL several times longer for the same thing.
 *
 * Anything the build does not know is dropped. The parsed value goes straight
 * into an API payload and into a React Query key, so a hand-edited URL must not
 * be able to put arbitrary strings in either.
 */
const readGroup = (params: URLSearchParams, group: FilterGroup): string[] => {
    const raw = params.get(group);

    if (!raw) return [];

    const known = filterOptions[group] as readonly string[];

    return [...new Set(raw.split(",").filter((code) => known.includes(code)))];
};

export const readFiltersFromParams = (params: URLSearchParams): JobFilters =>
    Object.fromEntries(GROUPS.map((group) => [group, readGroup(params, group)])) as JobFilters;

export const readSearchFromParams = (params: URLSearchParams) => params.get(SEARCH_PARAM) ?? "";

const hasFilterParams = (params: URLSearchParams) =>
    GROUPS.some((group) => params.has(group)) || params.has(SEARCH_PARAM);

const setOrDelete = (params: URLSearchParams, key: string, value: string) => {
    if (value) params.set(key, value);
    else params.delete(key);
};

/**
 * `page` is dropped as soon as anything is filtered: it numbers the unfiltered
 * feed, and starting a filtered one at page 3 would silently hide its first two
 * pages.
 */
const dropPageWhenFiltered = (params: URLSearchParams) => {
    if (hasFilterParams(params)) params.delete(PAGE_PARAM);

    return params;
};

/** every other param is left alone — this owns the filter keys only */
export const writeFiltersToParams = (params: URLSearchParams, filters: JobFilters) => {
    const next = new URLSearchParams(params);

    for (const group of GROUPS) setOrDelete(next, group, filters[group].join(","));

    return dropPageWhenFiltered(next);
};

/**
 * The value is stored exactly as it is sent to the API — trimming here would
 * make the URL and the request disagree, and the sync effect would rewrite the
 * query string on every render.
 */
export const writeSearchToParams = (params: URLSearchParams, searchString: string) => {
    const next = new URLSearchParams(params);

    setOrDelete(next, SEARCH_PARAM, searchString);

    return dropPageWhenFiltered(next);
};

/** what the URL looks like with no filters at all, `page` included */
export const clearFilterParams = (params: URLSearchParams) => {
    const next = new URLSearchParams(params);

    for (const group of GROUPS) next.delete(group);
    next.delete(SEARCH_PARAM);

    return next;
};
