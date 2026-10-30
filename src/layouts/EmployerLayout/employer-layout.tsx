import { Outlet, useLocation } from "react-router";

import { useT } from "@/i18n/use-t";
import { NavLink, useNavigate } from "@/i18n/navigation";

import AppHeader from "../AppLayout/app-header/app-header";
import { MainUserMenu } from "@/pages/Main/MainUserMenu";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";

import useCurrentUser from "@/hooks/useCurrentUser";
import { useLogout } from "@/hooks/use-auth-mutations";

import { isCompanyComplete } from "@/utils/company";

const NAV_ITEMS = [
    { path: "/employers/dashboard", labelKey: "nav.dashboard", requiresCompany: false },
    { path: "/employers/vacancies", labelKey: "nav.vacancies", requiresCompany: true },
    { path: "/employers/candidates", labelKey: "nav.candidates", requiresCompany: true },
    { path: "/employers/settings", labelKey: "nav.settings", requiresCompany: false },
] as const;

/** the mobile select has no room for a separate button, so log out is its last option */
const LOGOUT_VALUE = "logout";

function EmployerLayout() {
    const logout = useLogout();
    const navigate = useNavigate();
    const { t } = useT("employers");
    const { pathname } = useLocation();

    const { data: user } = useCurrentUser();

    if (!user) return;

    // vacancies are posted under the company, so there is nothing to show there until it is filled in
    const hasCompany = isCompanyComplete(user.company);
    const navItems = NAV_ITEMS.filter((item) => hasCompany || !item.requiresCompany);

    const activePath = navItems.find((item) => pathname.includes(item.path))?.path;

    // the logout clears `me`, and the employers guard takes it from there
    const handleSelect = (value: string) => {
        if (value === LOGOUT_VALUE) logout.mutate();
        else navigate(value);
    };

    return (
        <div className="employer-layout">
            <AppHeader className="employer-layout__header" minimal>
                {user.company?.name && <MainUserMenu user={user} />}
            </AppHeader>
            <main className="employer-layout__main">
                <aside className="employer-layout__sidebar">
                    <nav className="employer-layout__nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                className={({ isActive }) =>
                                    `employer-layout__nav-link ${isActive ? "employer-layout__nav-link_active" : ""}`
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
                        className="employer-layout__logout"
                    >
                        {t("nav.logout")}
                    </button>
                </aside>
                <div className="employer-layout__outlet-container">
                    <CustomSelect
                        hideLabel
                        id="navId"
                        value={activePath}
                        label={t("nav.label")}
                        className="employer-layout__select"
                        onValueChange={handleSelect}
                    >
                        {navItems.map((item) => (
                            <CustomSelectItem key={item.path} value={item.path}>
                                {t(item.labelKey)}
                            </CustomSelectItem>
                        ))}
                        <CustomSelectItem value={LOGOUT_VALUE}>{t("nav.logout")}</CustomSelectItem>
                    </CustomSelect>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default EmployerLayout;
