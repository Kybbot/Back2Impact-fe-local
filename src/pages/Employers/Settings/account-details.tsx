import type { ReactNode } from "react";

import { useT } from "@/i18n/use-t";

import { ChangePasswordDialog } from "@/pages/Profile/Settings/components/ChangePasswordDialog";

import type { UserData } from "@/services/user-service/types";

type Props = {
    user: UserData;
};

function AccountDetails({ user }: Props) {
    const { t } = useT("employers");

    const rows: { label: string; value: ReactNode }[] = [
        { label: t("settings.account.loginEmail"), value: user.email },
        {
            label: t("settings.account.password"),
            value: (
                <>
                    <span aria-hidden="true">••••••••••</span>
                    <ChangePasswordDialog triggerClassName="employer-settings__link" />
                </>
            ),
        },
        { label: t("settings.account.contactName"), value: user.fullName || "—" },
    ];

    return (
        <section className="employer-settings__card employer-settings__section">
            <h2 className="employer-settings__section-heading">{t("settings.account.heading")}</h2>

            <dl className="employer-settings__details">
                {rows.map((row) => (
                    <div key={row.label} className="employer-settings__details-row">
                        <dt className="employer-settings__details-label">{row.label}</dt>
                        <dd className="employer-settings__details-value">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

export default AccountDetails;
