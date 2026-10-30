import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import VacanciesTable from "./vacancies-table";
import CloseDialog from "../vacancy-form/close-dialog";
import DeleteDialog from "../vacancy-form/delete-dialog";
import VacancyDialog from "../vacancy-form/vacancy-dialog";
import DeadlineDialog from "../vacancy-form/deadline-dialog";

import { useT } from "@/i18n/use-t";

import Pagination from "@/components/shared/pagination/pagination";
import ErrorBlock from "@/components/shared/error-block/error-block";
import LoaderBlock from "@/components/shared/loader-block/loader-block";

import { useEmployerJobs } from "@/services/employer-service";
import type { EmployerJobType } from "@/services/employer-service/types";

const PAGE_SIZE = 10;

/** `?page=` as a whole page number, anything else is the first page */
const parsePage = (value: string | null) => {
    const page = Number(value);

    return Number.isInteger(page) && page > 1 ? page : 1;
};

/** the first page has no `?page=`, so it has one url */
const toSearchParams = (page: number): Record<string, string> => (page > 1 ? { page: String(page) } : {});

type DialogState =
    /** `job: null` posts a new vacancy, filled in from `copyOf` when there is one */
    | { type: "vacancy"; job: EmployerJobType | null; copyOf?: EmployerJobType }
    | { type: "reopen" | "close" | "delete"; job: EmployerJobType };

function EmployerVacancies() {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parsePage(searchParams.get("page"));

    const { data, isPending, isError, isPlaceholderData } = useEmployerJobs({ page, pageSize: PAGE_SIZE });

    /** `null` while closed */
    const [dialog, setDialog] = useState<DialogState | null>(null);
    const closeDialog = () => setDialog(null);

    // past the end — a stale link, or the last vacancy of the last page gone: show the last page there is
    const lastPage = !data || isPlaceholderData ? null : Math.max(data.totalPages, 1);
    const hasVacancies = !!data && data.total > 0;

    const renderContent = () => {
        if (isPending) return <LoaderBlock className="loader-block--blue employer-vacancies__loader" />;
        if (isError) return <ErrorBlock message={tErrors("generic.reload")} />;

        if (!hasVacancies)
            return (
                <section className="employer-vacancies__card employer-vacancies__empty">
                    <span className="employer-vacancies__empty-emoji" aria-hidden="true">
                        📋
                    </span>
                    <div className="employer-vacancies__empty-text">
                        <h2 className="employer-vacancies__empty-heading">{t("vacancies.empty.heading")}</h2>
                        <p className="employer-vacancies__muted">{t("vacancies.empty.description")}</p>
                    </div>
                    <button
                        type="button"
                        className="employer-vacancies__btn"
                        onClick={() => setDialog({ type: "vacancy", job: null })}
                    >
                        {t("vacancies.postVacancy")}
                    </button>
                </section>
            );

        return (
            <section className="employer-vacancies__card employer-vacancies__list">
                <VacanciesTable
                    jobs={data.data}
                    isStale={isPlaceholderData}
                    onEdit={(job) => setDialog({ type: "vacancy", job })}
                    onDuplicate={(job) => setDialog({ type: "vacancy", job: null, copyOf: job })}
                    onReopen={(job) => setDialog({ type: "reopen", job })}
                    onClose={(job) => setDialog({ type: "close", job })}
                    onDelete={(job) => setDialog({ type: "delete", job })}
                />
                <Pagination
                    page={page}
                    totalPages={data.totalPages}
                    onChange={(next) => setSearchParams(toSearchParams(next))}
                />
            </section>
        );
    };

    useEffect(() => {
        if (lastPage !== null && page > lastPage)
            setSearchParams(toSearchParams(lastPage), { replace: true });
    }, [lastPage, page, setSearchParams]);

    return (
        <div className="employer-vacancies">
            <section className="employer-vacancies__card employer-vacancies__header">
                <div className="employer-vacancies__emoji-container" aria-hidden="true">
                    <span>📋</span>
                </div>
                <div className="employer-vacancies__header-text">
                    <h1 className="employer-vacancies__heading">{t("vacancies.heading")}</h1>
                    <p className="employer-vacancies__muted">{t("vacancies.description")}</p>
                </div>
                {/* the empty state carries its own, one is enough */}
                {hasVacancies && (
                    <button
                        type="button"
                        className="employer-vacancies__btn"
                        onClick={() => setDialog({ type: "vacancy", job: null })}
                    >
                        {t("vacancies.postVacancy")}
                    </button>
                )}
            </section>

            {renderContent()}

            {dialog?.type === "vacancy" && (
                <VacancyDialog job={dialog.job} copyOf={dialog.copyOf} onClose={closeDialog} />
            )}
            {dialog?.type === "reopen" && (
                <DeadlineDialog action="reopen" job={dialog.job} onClose={closeDialog} />
            )}
            {dialog?.type === "close" && <CloseDialog job={dialog.job} onClose={closeDialog} />}
            {dialog?.type === "delete" && <DeleteDialog job={dialog.job} onClose={closeDialog} />}
        </div>
    );
}

export default EmployerVacancies;
