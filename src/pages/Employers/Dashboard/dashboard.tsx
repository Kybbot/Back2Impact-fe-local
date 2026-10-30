import { useState } from "react";

import DashboardStats from "./dashboard-stats";
import CompanyProfile from "./company-profile";
import CompanyPreview from "./company-preview";
import EditCompanyDialog from "./edit-company-dialog";
import VacancyDialog from "../vacancy-form/vacancy-dialog";

import { useT } from "@/i18n/use-t";

import useCurrentUser from "@/hooks/useCurrentUser";

import { isCompanyComplete } from "@/utils/company";

function EmployerDashboard() {
    const { t } = useT("employers");
    const { data: user } = useCurrentUser();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isVacancyOpen, setIsVacancyOpen] = useState(false);

    if (!user) return;

    const { company } = user;
    const isComplete = isCompanyComplete(company);

    return (
        <div className="employer-dashboard">
            <section className="employer-dashboard__welcome">
                <div className="employer-dashboard__emoji-container" aria-hidden="true">
                    <span>👋</span>
                </div>
                <div className="employer-dashboard__welcome-text">
                    <h1 className="employer-dashboard__heading">
                        {t("dashboard.welcome", { name: user.fullName })}
                    </h1>
                    <p className="employer-dashboard__muted">{t("dashboard.welcomeDescription")}</p>
                </div>
                {isComplete && (
                    <button
                        type="button"
                        className="employer-dashboard__btn"
                        onClick={() => setIsVacancyOpen(true)}
                    >
                        {t("dashboard.postVacancy")}
                    </button>
                )}
            </section>

            <DashboardStats />

            {!isComplete && (
                <div className="employer-dashboard__card employer-dashboard__notice employer-dashboard__notice_info">
                    <span className="employer-dashboard__notice-emoji" aria-hidden="true">
                        ✍️
                    </span>
                    <div className="employer-dashboard__notice-text">
                        <p className="employer-dashboard__notice-heading">
                            {t("dashboard.incomplete.heading")}
                        </p>
                        <p className="employer-dashboard__muted">{t("dashboard.incomplete.description")}</p>
                    </div>
                    <button
                        type="button"
                        className="employer-dashboard__notice-btn"
                        onClick={() => setIsEditOpen(true)}
                    >
                        {t("dashboard.incomplete.action")}
                    </button>
                </div>
            )}

            <CompanyProfile company={company} onEdit={() => setIsEditOpen(true)} />

            {company?.name && <CompanyPreview company={company} />}

            {isEditOpen && (
                <EditCompanyDialog
                    company={company}
                    onClose={() => setIsEditOpen(false)}
                    additionalEmail={user.additionalEmail || user.email}
                />
            )}

            {isVacancyOpen && <VacancyDialog job={null} onClose={() => setIsVacancyOpen(false)} />}
        </div>
    );
}

export default EmployerDashboard;
