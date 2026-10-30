import { Link, NavLink } from "../../i18n/navigation";

import LanguageSwitcher from "@/components/shared/language-switcher/language-switcher";

import { useT } from "../../i18n/use-t";

type Props = {
    fullName: string;
    profilePictureUrl?: string | null;
};

function ProfileHeader({ fullName, profilePictureUrl }: Props) {
    const { t } = useT("profile");

    return (
        <header className="profile-header">
            <Link to="/" className="profile-header__logo">
                Back 2 impact
            </Link>
            <nav className="profile-header__nav">
                <NavLink className="profile-header__nav-link" to="/jobs/all">
                    {t("headerNav.opportunities")}
                </NavLink>
                {/* <NavLink className="profile-header__nav-link" to="#">
                    {t("headerNav.stories")}
                </NavLink>
                <NavLink className="profile-header__nav-link" to="#">
                    {t("headerNav.projects")}
                </NavLink> */}
            </nav>
            <div className="profile-header__wrapper">
                <div className="profile-header__profile-block">
                    <div className="profile-header__profile-pic-container">
                        {profilePictureUrl ? (
                            <img
                                src={profilePictureUrl}
                                className="profile-header__profile-pic"
                                alt={t("profilePhotoAlt")}
                                aria-hidden="true"
                            />
                        ) : (
                            <p className="profile-header__alt-pic-str">?</p>
                        )}
                    </div>
                    <p className="profile-header__user-name">{fullName}</p>
                </div>
                <LanguageSwitcher />
            </div>
        </header>
    );
}

export default ProfileHeader;
