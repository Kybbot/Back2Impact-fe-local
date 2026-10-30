import { useOutletContext } from "react-router";
import type { JobFilters, JobListType } from "@/types/jobs";

export type JobsOutletContext = {
    searchString: string;
    filters: JobFilters;
    onApplyClick: (job: JobListType) => void;
    onClearFiltersClick: () => void;
};

export const useJobsContext = () => useOutletContext<JobsOutletContext>();
