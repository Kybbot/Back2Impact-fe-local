import type { ReactNode } from "react";

import CompanyLogo from "./company-logo";

import { useT } from "@/i18n/use-t";
import { useOptionLabel } from "@/i18n/options";
import { useLocalized } from "@/i18n/pick-localized";

import { formatCompanySize, formatWebsite, type Company } from "@/utils/company";

type Props = {
    company: Company | null;
    onEdit: () => void;
};

function CompanyProfile({ company, onEdit }: Props) {
    const { t } = useT("employers");
    const label = useOptionLabel();
    const localized = useLocalized();

    const rows: { label: string; value: ReactNode }[] = [
        {
            label: t("dashboard.profile.about"),
            value: company && localized(company, "description"),
        },
        {
            label: t("setup.fields.sectors"),
            value: company?.sectors?.map((sector) => label("onboarding.sectors", sector)).join(" · "),
        },
        {
            label: t("setup.fields.companySize"),
            value: company?.companySize && formatCompanySize(company.companySize),
        },
        { label: t("setup.fields.headquarters"), value: company?.headquarters },
        { label: t("setup.fields.founded"), value: company?.founded },
    ];

    return (
        <section className="employer-dashboard__card employer-dashboard__section">
            <div className="employer-dashboard__section-header">
                <div className="employer-dashboard__section-heading-container">
                    <h2 className="employer-dashboard__section-heading">{t("dashboard.profile.heading")}</h2>
                    <p className="employer-dashboard__muted">{t("dashboard.profile.description")}</p>
                </div>
                <button type="button" className="employer-dashboard__edit-btn" onClick={onEdit}>
                    {t("dashboard.profile.edit")}
                </button>
            </div>

            <div className="employer-dashboard__company">
                <CompanyLogo
                    name={company?.name ?? null}
                    logoKey={company?.logoKey ?? null}
                    className="company-logo_large"
                />
                <div className="employer-dashboard__company-name-container">
                    <p className="employer-dashboard__company-name">{company?.name || "—"}</p>
                    {company?.website && (
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="employer-dashboard__company-website"
                        >
                            {formatWebsite(company.website)}
                        </a>
                    )}
                </div>
            </div>

            <dl className="employer-dashboard__details">
                {rows.map((row) => (
                    <div key={row.label} className="employer-dashboard__details-row">
                        <dt className="employer-dashboard__details-label">{row.label}</dt>
                        <dd className="employer-dashboard__details-value">{row.value || "—"}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

export default CompanyProfile;
