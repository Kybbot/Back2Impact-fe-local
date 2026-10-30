import { useRef } from "react";
import { DropdownMenu } from "radix-ui";

import { useT } from "@/i18n/use-t";
import { Link } from "@/i18n/navigation";
import { useLocalized } from "@/i18n/pick-localized";

import type { EmployerJobType } from "@/services/employer-service/types";

import { getPortalContainer } from "@/utils/portal-container";

/** the actions that open a dialog; "continue" and "edit" are the same vacancy dialog */
export type VacancyDialogAction = "continue" | "edit" | "duplicate" | "reopen" | "close" | "delete";

/** "candidates" is a link */
type Action = VacancyDialogAction | "candidates";

type Props = {
    job: EmployerJobType;
    onAction: Record<VacancyDialogAction, (job: EmployerJobType) => void>;
};

/** the most used first, closing or deleting a vacancy last; only a draft can be deleted */
const getActions = ({ status }: EmployerJobType): Action[] => {
    switch (status) {
        case "draft":
            return ["continue", "duplicate", "delete"];
        case "rejected":
            return ["duplicate"];
        case "pending_review":
            return ["edit", "duplicate"];
        case "published":
            return ["candidates", "edit", "close", "duplicate"];
        case "expired":
            return ["close", "reopen", "duplicate"];
        case "closed":
            return ["duplicate"];
    }
};

function VacancyActionsMenu({ job, onAction }: Props) {
    const { t } = useT("employers");
    const localized = useLocalized();

    // the picked dialog opens once the menu has closed and given the focus back to its trigger,
    // so the two don't fight over it, and the dialog returns it there in turn
    const picked = useRef<VacancyDialogAction | null>(null);

    const actions = getActions(job);

    if (!actions.length) return null;

    const openPicked = () => {
        const action = picked.current;

        picked.current = null;
        if (action) onAction[action](job);
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className="employer-vacancies__menu-trigger"
                    aria-label={t("vacancies.table.actions")}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#333333" aria-hidden="true">
                        <circle cx="4" cy="10" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="16" cy="10" r="1.5" />
                    </svg>
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal container={getPortalContainer()}>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    collisionPadding={16}
                    className="employer-vacancies__menu"
                    onCloseAutoFocus={openPicked}
                >
                    {actions.map((action) =>
                        action === "candidates" ? (
                            <DropdownMenu.Item key={action} asChild className="employer-vacancies__menu-item">
                                <Link
                                    to={`/employers/candidates?search=${encodeURIComponent(localized(job, "name"))}`}
                                >
                                    {t(`vacancies.actions.${action}`)}
                                </Link>
                            </DropdownMenu.Item>
                        ) : (
                            <DropdownMenu.Item
                                key={action}
                                className="employer-vacancies__menu-item"
                                onSelect={() => (picked.current = action)}
                            >
                                {t(`vacancies.actions.${action}`)}
                            </DropdownMenu.Item>
                        ),
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default VacancyActionsMenu;
