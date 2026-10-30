import { NavLink } from "../../i18n/navigation";
import { useT } from "../../i18n/use-t";
import DefaultJobsList from "./components/default-jobs-list/default-jobs-list";
import { useJobsContext } from "./components/jobs-block/jobs-context";
import { useIsLoggedIn } from "../../hooks/useCurrentUser";

function ForYouJobs() {
    const { t } = useT("jobs");
    const isLoggedIn = useIsLoggedIn();
    const {
        searchString,
        filters,
        onApplyClick,
        onClearFiltersClick,
    } = useJobsContext();

    if (!isLoggedIn)
        return (
            <div className="for-you-jobs__get-match-sub-screen">
                <h2 className="for-you-jobs__get-match-heading">{t("forYou.heading")}</h2>
                <p className="for-you-jobs__get-match-description">{t("forYou.description")}</p>
                <NavLink className="for-you-jobs__get-match-sign-up-link" to="/auth?tab=sign-up">
                    {t("forYou.signUp")}
                </NavLink>
                <NavLink className="for-you-jobs__get-match-login-link" to="/auth?tab=login">
                    {t("forYou.hasAccount")}{" "}
                    <span className="for-you-jobs__get-match-login-span">{t("forYou.logIn")}</span>
                </NavLink>
            </div>
        );

    return (
        <DefaultJobsList
            sortType="for_you"
            filters={filters}
            searchString={searchString}
            onApplyClick={onApplyClick}
            onClearFiltersClick={onClearFiltersClick}
        />
    );
}

export default ForYouJobs;
