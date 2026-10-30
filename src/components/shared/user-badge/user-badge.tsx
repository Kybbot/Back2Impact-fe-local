import CompanyLogo from "@/pages/Employers/Dashboard/company-logo";

import { NavLink } from "@/i18n/navigation";
import { useT } from "@/i18n/use-t";
import type { UserData } from "@/services/user-service/types";
import { getProfilePath } from "@/utils/home-path";

type Props = {
    user: UserData;
    className?: string;
};

/**
 * What the badge shows: an employer as their company once it has a name,
 * everyone else by their photo and name. On its own for a badge that is
 * not a link, like the main page's menu trigger.
 */
export function UserBadgeContent({ user }: Pick<Props, "user">) {
    const { t } = useT("common");

    const company = user.role === "employer" ? user.company : null;

    return company?.name ? (
        <>
            <CompanyLogo name={company.name} logoKey={company.logoKey} className="company-logo_small" />
            <p className="app-header__user-name">{company.name}</p>
        </>
    ) : (
        <>
            <div className="app-header__profile-pic-container">
                {user.profilePictureUrl ? (
                    <img
                        aria-hidden="true"
                        src={user.profilePictureUrl}
                        alt={t("nav.profilePhotoAlt")}
                        className="app-header__profile-pic"
                    />
                ) : (
                    <p className="app-header__alt-pic-str">?</p>
                )}
            </div>
            <p className="app-header__user-name">{user.fullName}</p>
        </>
    );
}

/** the signed-in account, linking to its own page */
function UserBadge({ user, className }: Props) {
    return (
        <NavLink className={`app-header__user-block ${className ?? ""}`} to={getProfilePath(user)}>
            <UserBadgeContent user={user} />
        </NavLink>
    );
}

export default UserBadge;
