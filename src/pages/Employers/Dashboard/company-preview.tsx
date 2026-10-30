import CompanyLogo from "./company-logo";

import { useT } from "@/i18n/use-t";
import { useOptionLabel } from "@/i18n/options";
import { useLocalized } from "@/i18n/pick-localized";

import { formatCompanySize, type Company } from "@/utils/company";

type Props = {
    company: Company;
};

/** the company block of a vacancy card, as a candidate sees it */
function CompanyPreview({ company }: Props) {
    const { t } = useT("employers");
    const label = useOptionLabel();
    const localized = useLocalized();

    const description = localized(company, "description");

    const meta = [
        ...(company.sectors ?? []).map((sector) => label("onboarding.sectors", sector)),
        company.companySize &&
            t("setup.fields.companySizeOption", { range: formatCompanySize(company.companySize) }),
        company.headquarters,
    ].filter(Boolean);

    return (
        <section className="employer-dashboard__card employer-dashboard__section">
            <div className="employer-dashboard__section-heading-container">
                <h2 className="employer-dashboard__section-heading">{t("dashboard.preview.heading")}</h2>
                <p className="employer-dashboard__muted">{t("dashboard.preview.description")}</p>
            </div>

            <div className="employer-dashboard__preview">
                <div className="employer-dashboard__company">
                    <CompanyLogo name={company.name} logoKey={company.logoKey} />
                    <div className="employer-dashboard__company-name-container">
                        <p className="employer-dashboard__preview-name">{company.name}</p>
                        {meta.length > 0 && <p className="employer-dashboard__muted">{meta.join(" · ")}</p>}
                    </div>
                </div>
                {description && <p className="employer-dashboard__preview-description">{description}</p>}
            </div>
        </section>
    );
}

export default CompanyPreview;
