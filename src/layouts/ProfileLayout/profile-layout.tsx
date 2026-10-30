import { Outlet, useLocation } from "react-router";
import { NavLink, useNavigate } from "../../i18n/navigation";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useLogout } from "../../hooks/use-auth-mutations";
import { useT } from "../../i18n/use-t";
import AppHeader from "../AppLayout/app-header/app-header";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";

const NAV_ITEMS = [
    { path: "/profile/about-me", labelKey: "nav.aboutMe" },
    { path: "/profile/experience", labelKey: "nav.experience" },
    { path: "/profile/documents", labelKey: "nav.documents" },
    { path: "/profile/settings", labelKey: "nav.settings" },
] as const;

/** the mobile select has no room for a separate button, so log out is its last option */
const LOGOUT_VALUE = "logout";

function ProfileLayout() {
    const logout = useLogout();
    const { t } = useT("profile");
    const { data: user } = useCurrentUser();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    if (!user) return;

    const activePath = NAV_ITEMS.find((item) => pathname.includes(item.path))?.path;

    // the logout clears `me`, and the guard takes it from there
    const handleSelect = (value: string) => {
        if (value === LOGOUT_VALUE) logout.mutate();
        else navigate(value);
    };

    return (
        <div className="profile-layout">
            <AppHeader className="profile-layout__header" user={user ?? null} />
            <main className="profile-layout__main">
                <aside className="profile-layout__sidebar">
                    <nav className="profile-layout__nav">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.path}
                                className={({ isActive }) =>
                                    `profile-layout__nav-link ${isActive ? "profile-layout__nav-link_active" : ""}`
                                }
                                to={item.path}
                            >
                                {t(item.labelKey)}
                            </NavLink>
                        ))}
                    </nav>
                    <button
                        type="button"
                        disabled={logout.isPending}
                        onClick={() => logout.mutate()}
                        className="profile-layout__logout"
                    >
                        {t("nav.logout")}
                    </button>
                </aside>
                <div className="profile-layout__outlet-container">
                    <CustomSelect
                        hideLabel
                        id="navId"
                        isRequired
                        value={activePath}
                        className="profile-layout__select"
                        onValueChange={handleSelect}
                    >
                        {NAV_ITEMS.map((item) => (
                            <CustomSelectItem key={item.path} value={item.path}>
                                {t(item.labelKey)}
                            </CustomSelectItem>
                        ))}
                        <CustomSelectItem value={LOGOUT_VALUE}>{t("nav.logout")}</CustomSelectItem>
                    </CustomSelect>
                    <Outlet
                        context={{
                            profilePictureUrl: user?.profilePictureUrl,
                            userName: user.fullName,
                            email: user.email,
                        }}
                    />
                </div>
            </main>
        </div>
    );
}

export default ProfileLayout;
