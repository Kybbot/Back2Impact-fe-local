import { useNavigate } from "../../i18n/navigation";
import UserJobsList from "./components/user-jobs-list/user-jobs-list";
import { useJobsContext } from "./components/jobs-block/jobs-context";

function SavedJobs() {
    const navigate = useNavigate();

    const { searchString, filters, onApplyClick } = useJobsContext();

    return (
        <UserJobsList
            jobsType="saved"
            filters={filters}
            searchString={searchString}
            onApplyClick={onApplyClick}
            onBrowseJobsClick={() => navigate("/jobs/all")}
        />
    );
}

export default SavedJobs;
