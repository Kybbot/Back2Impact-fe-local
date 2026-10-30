import { Dialog } from "radix-ui";
import { Trans } from "react-i18next";
import { useT } from "@/i18n/use-t";

type Props = {
    onCancel: () => void;
    onConfirm: () => void;
};

// Rendered in place of a dirty form inside its Dialog.Content, so it takes over the dialog's title
function DiscardChangesPopup({ onCancel, onConfirm }: Props) {
    const { t } = useT("profile");

    return (
        <div className="edit-basic-info-form__popup">
            <div className="edit-basic-info-form__popup-main">
                <Dialog.Title asChild>
                    <p className="edit-basic-info-form__popup-heading">
                        <Trans t={t} i18nKey="discard.heading" components={{ br: <br /> }} />
                    </p>
                </Dialog.Title>
                <Dialog.Description asChild>
                    <p className="edit-basic-info-form__popup-description">{t("discard.description")}</p>
                </Dialog.Description>
            </div>
            <div className="edit-basic-info-form__btns-container">
                {/* the button that had focus is gone or hidden by now; without this focus falls to
                the dialog container, or to <body> when the form is only hidden */}
                <button
                    className="edit-basic-info-form__btn edit-basic-info-form__btn_cancel"
                    type="button"
                    autoFocus
                    onClick={onCancel}
                >
                    {t("cancel")}
                </button>
                <button
                    className="edit-basic-info-form__btn edit-basic-info-form__btn_save"
                    type="button"
                    onClick={onConfirm}
                >
                    {t("discard.confirm")}
                </button>
            </div>
        </div>
    );
}

export default DiscardChangesPopup;
