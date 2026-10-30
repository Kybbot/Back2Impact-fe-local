import DefaultJobsList from "./components/default-jobs-list/default-jobs-list";
import { useJobsContext } from "./components/jobs-block/jobs-context";
import type { GetAllJobsListType } from "@/types/jobs";

type Props = {
    /** page rendered by the /jobs/all loader */
    initialPage?: GetAllJobsListType;
    initialPageNumber?: number;
    /** the page's <h1>; the design has no visible one, so it is screen-reader only */
    heading?: string;
    paginationPath?: string;
};

function AllJobs({ initialPage, initialPageNumber, heading, paginationPath }: Props) {
    const {
        searchString,
        filters,
        onApplyClick,
        onClearFiltersClick,
    } = useJobsContext();

    return (
        <>
            {heading && <h1 className="visually-hidden">{heading}</h1>}
            <DefaultJobsList
                sortType="all"
                filters={filters}
                initialPage={initialPage}
                searchString={searchString}
                paginationPath={paginationPath}
                initialPageNumber={initialPageNumber}
                onApplyClick={onApplyClick}
                onClearFiltersClick={onClearFiltersClick}
            />
        </>
    );
}

export default AllJobs;
