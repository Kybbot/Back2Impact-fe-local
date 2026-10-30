import { useState } from "react";
import { Dialog } from "radix-ui";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";

import StatusChangeForm from "./status-change-form";
import type { NotifyingStatus } from "./status-change-schema";
import { getScoreTone, useFormatScore, useWorkLocationLabel } from "./candidate-format";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "@/i18n/pick-localized";
import { useLanguageLabel } from "@/i18n/language-options";
import { useCountryLabel, useOptionLabel } from "@/i18n/options";

import ErrorBlock from "@/components/shared/error-block/error-block";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";

import {
    EMPLOYER_APPLICATION_STATUSES,
    type EmployerApplicationType,
    type EmployerApplicationStatus,
    type PatchEmployerApplicationStatusDTO,
} from "@/services/employer-service/types";
import { usePatchApplicationStatus } from "@/services/employer-service";

import { useFormatShortDate } from "@/utils/date";
import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    application: EmployerApplicationType;
    onClose: () => void;
};

type OptionGroup = "opportunityTypes" | "professionalAreas" | "sectors";

/** a status change the candidate is told about, waiting on its form */
type PendingChange = {
    status: NotifyingStatus;
    /** set from the footer buttons, which finish with the candidate; the status select stays on them */
    closeAfter: boolean;
};

const EMPTY = "—";

/**
 * an application only moves forward through the list — any later status, never an earlier one;
 * a hired candidate is done with, so "hired" can't be turned into "not a fit" either
 */
const canMoveTo = (from: EmployerApplicationStatus, to: EmployerApplicationStatus) =>
    from !== "hired" &&
    EMPLOYER_APPLICATION_STATUSES.indexOf(to) > EMPLOYER_APPLICATION_STATUSES.indexOf(from);

/** mounted only while open, so every opening starts from the application as listed */
function CandidateDialog({ application, onClose }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const localized = useLocalized();
    const optionLabel = useOptionLabel();
    const countryLabel = useCountryLabel();
    const languageLabel = useLanguageLabel();
    const formatDate = useFormatShortDate();
    const formatScore = useFormatScore();
    const workLocationLabel = useWorkLocationLabel();

    const patchStatus = usePatchApplicationStatus();

    // kept here rather than read back from the list: the list is refetched after
    // every change, and under a status filter the application may drop off it
    const [status, setStatus] = useState(application.status);
    /** the form shown in place of the profile, `null` while the profile is */
    const [pending, setPending] = useState<PendingChange | null>(null);

    const { user, cv, attachment, letter } = application;
    const isBusy = patchStatus.isPending;

    const listOptions = (group: OptionGroup, codes: string[] | null) =>
        (codes ?? []).map((code) => optionLabel(`onboarding.${group}`, code)).join(", ");

    /** "Ukrainian C1, English B2"; the level is a code */
    const languages = user.languages
        .map(({ language, level }) =>
            level === "native"
                ? t("candidates.dialog.nativeLanguage", { language: languageLabel(language) })
                : `${languageLabel(language)} ${level.toUpperCase()}`,
        )
        .join(", ");

    const details = [
        { key: "basedIn", value: countryLabel(user.basedCountry, false) },
        { key: "workLocation", value: workLocationLabel(user, true) },
        { key: "lookingFor", value: listOptions("opportunityTypes", user.opportunityTypes) },
        { key: "professions", value: listOptions("professionalAreas", user.professionalAreas) },
        { key: "sectors", value: listOptions("sectors", user.sectors) },
        { key: "languages", value: languages },
    ] as const;

    const files = (
        [
            { key: "cv", file: cv },
            { key: "attachment", file: attachment },
        ] as const
    ).flatMap(({ key, file }) => (file ? [{ key, file }] : []));

    // from "hired" or "not a fit" the select has nowhere to go
    const isFinal = !EMPLOYER_APPLICATION_STATUSES.some((item) => canMoveTo(status, item));

    // a failed save is shown only in the view it happened in
    const showView = (next: PendingChange | null) => {
        patchStatus.reset();
        setPending(next);
    };

    // Esc, outside click and every Dialog.Close end up here; from a form they step back to the profile
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen || isBusy) return;

        if (pending) showView(null);
        else onClose();
    };

    const changeStatus = (pl: PatchEmployerApplicationStatusDTO, { close = false } = {}) => {
        patchStatus.mutate(pl, {
            onSuccess: () => {
                setStatus(pl.status);
                setPending(null);
                toast.success(t("candidates.dialog.statusSaved"));

                if (close) onClose();
            },
            onError: (e) => {
                Sentry.captureException(e);
            },
        });
    };

    // only "in review" goes straight through; the rest email the candidate, so they open a form first
    const selectStatus = (next: EmployerApplicationStatus) => {
        if (next === "in_review") changeStatus({ id: application.id, status: next });
        else if (next !== "new") showView({ status: next, closeAfter: false });
    };

    const renderProfile = () => (
        <>
            <div className="candidate-dialog__header">
                <Dialog.Title className="candidate-dialog__title">{user.fullName}</Dialog.Title>
                <Dialog.Close asChild>
                    <button
                        type="button"
                        disabled={isBusy}
                        className="candidate-dialog__close"
                        aria-label={t("candidates.dialog.close")}
                    >
                        <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 13 13"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke="#333333"
                                strokeWidth="1.5"
                                strokeOpacity="0.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.75 0.75L0.75 11.75M11.75 11.75L0.75 0.75"
                            />
                        </svg>
                    </button>
                </Dialog.Close>
            </div>

            <div className="candidate-dialog__main">
                <div className="candidate-dialog__summary">
                    <p
                        className={`candidate-dialog__score employer-candidates__score_${getScoreTone(application.score)}`}
                    >
                        {t("candidates.dialog.match", { score: formatScore(application.score) })}
                    </p>
                    <p className="candidate-dialog__muted">
                        {t("candidates.dialog.applied", {
                            date: formatDate(application.createdAt),
                            vacancy: localized(application.job, "name") || t("vacancies.table.untitled"),
                        })}
                    </p>
                </div>

                <div className="candidate-dialog__status">
                    <CustomSelect
                        id="candidateStatusId"
                        value={status}
                        disabled={isBusy || isFinal}
                        label={t("candidates.dialog.status")}
                        className="candidate-dialog__select"
                        onValueChange={(value) => selectStatus(value as EmployerApplicationStatus)}
                    >
                        {EMPLOYER_APPLICATION_STATUSES.map((item) => (
                            <CustomSelectItem
                                key={item}
                                value={item}
                                disabled={item !== status && !canMoveTo(status, item)}
                            >
                                {t(`candidates.status.${item}`)}
                            </CustomSelectItem>
                        ))}
                    </CustomSelect>
                    <p className="candidate-dialog__muted">{t("candidates.dialog.statusHint")}</p>
                </div>

                <dl className="candidate-dialog__details">
                    {details.map(({ key, value }) => (
                        <div key={key} className="candidate-dialog__detail">
                            <dt className="candidate-dialog__term">
                                {t(`candidates.dialog.details.${key}`)}
                            </dt>
                            <dd className="candidate-dialog__value">{value || EMPTY}</dd>
                        </div>
                    ))}
                </dl>

                {user.workExperiences.length > 0 && (
                    <section className="candidate-dialog__section">
                        <h3 className="candidate-dialog__section-heading">
                            {t("candidates.dialog.experience")}
                        </h3>
                        <ul className="candidate-dialog__cards">
                            {user.workExperiences.map((item) => (
                                <li key={item.id} className="candidate-dialog__card">
                                    <p className="candidate-dialog__card-title">{item.title}</p>
                                    <p className="candidate-dialog__card-text">{item.company}</p>
                                    <p className="candidate-dialog__card-text">
                                        {item.startYear} – {item.endYear ?? t("candidates.dialog.present")}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(files.length > 0 || letter) && (
                    <section className="candidate-dialog__section">
                        <h3 className="candidate-dialog__section-heading">
                            {t("candidates.dialog.attached")}
                        </h3>
                        <ul className="candidate-dialog__cards">
                            {files.map(({ key, file }) => (
                                <li key={key} className="candidate-dialog__card candidate-dialog__card_file">
                                    <div className="candidate-dialog__file">
                                        <p className="candidate-dialog__card-title">{file.name}</p>
                                        <p className="candidate-dialog__card-text">
                                            {t(`candidates.dialog.files.${key}`)}
                                        </p>
                                    </div>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={file.name}
                                        className="candidate-dialog__download"
                                    >
                                        {t("candidates.dialog.download")}
                                    </a>
                                </li>
                            ))}
                            {letter && (
                                <li className="candidate-dialog__card">
                                    <p className="candidate-dialog__card-title">
                                        {t("candidates.dialog.coverLetter")}
                                    </p>
                                    <p className="candidate-dialog__card-text candidate-dialog__letter">
                                        {letter}
                                    </p>
                                </li>
                            )}
                        </ul>
                    </section>
                )}
            </div>

            <div className="candidate-dialog__footer">
                {patchStatus.isError && (
                    <ErrorBlock
                        className="candidate-dialog__error"
                        message={tErrors("generic.tryAgainSoon")}
                    />
                )}
                <button
                    type="button"
                    className="candidate-dialog__btn"
                    disabled={isBusy || !canMoveTo(status, "not_a_fit")}
                    onClick={() => showView({ status: "not_a_fit", closeAfter: true })}
                >
                    {t("candidates.dialog.notAFit")}
                </button>
                <button
                    type="button"
                    disabled={isBusy || !canMoveTo(status, "invited")}
                    className="candidate-dialog__btn candidate-dialog__btn_primary"
                    onClick={() => showView({ status: "invited", closeAfter: true })}
                >
                    {t("candidates.dialog.invite")}
                </button>
            </div>
        </>
    );

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="candidate-dialog__overlay" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className={`candidate-dialog__content ${
                        pending?.status === "not_a_fit" ? "candidate-dialog__content_narrow" : ""
                    }`}
                >
                    {pending ? (
                        <StatusChangeForm
                            isBusy={isBusy}
                            status={pending.status}
                            application={application}
                            isError={patchStatus.isError}
                            onSubmit={(pl) => changeStatus(pl, { close: pending.closeAfter })}
                        />
                    ) : (
                        renderProfile()
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default CandidateDialog;
