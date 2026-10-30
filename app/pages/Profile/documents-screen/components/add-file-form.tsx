import { useT } from "@/i18n/use-t";
import { useState } from "react";
import { Dialog } from "radix-ui";
import closeIcon from "/img/close-icon.svg";
import alertIcon from "/img/alert-icon.svg";
import { FileUpload } from "@/components/widgets/file-upload/file-upload";
import DiscardChangesPopup from "@/components/shared/discard-changes-popup/discard-changes-popup";
import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    isOpen: boolean;
    addImgErrorMsg: string | null;
    fileType: "cv" | "portfolio" | "cover_letter" | "other";
    className?: string;
    onFileSelect: (f: File) => Promise<string> | string;
    onClose: () => void;
    onClick: (pl: { file: File; key: string }) => void;
};

const MAX_FILE_SIZE = 1024 * 1024 * 10;

function AddFileForm({ isOpen, className, fileType, addImgErrorMsg, onFileSelect, onClose, onClick }: Props) {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const [file, setFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [fileKey, setFileKey] = useState<string | null>(null);
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    // Esc, outside click and both Dialog.Close buttons all end up here;
    // a picked file is the only thing the form can lose
    const handleOpenChange = (open: boolean) => {
        if (open) return;

        if (file) setShowDiscardPopup(true);
        else onClose();
    };

    const handleFileSelect = async (files: File[]) => {
        try {
            const file = files[0];

            if (!file) {
                setFile(null);
                setFileKey(null);

                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setErrorMsg(tErrors("file.tooBig"));

                return;
            }

            if (errorMsg) setErrorMsg(null);

            const key = await onFileSelect(file);

            setFile(file);
            setFileKey(key);
        } catch {
            setErrorMsg(tErrors("file.uploadFailed"));
        }
    };

    const handleClick = () => {
        if (file && fileKey) onClick({ file, key: fileKey });
    };

    const accept = fileType === "cv" ? ".pdf, .doc, .docx" : ".pdf, .doc, .docx, .ppt, .pptx";
    const formatsLabel = fileType !== "cv" ? "PDF, DOC, DOCX, PPT, PPTX" : undefined;

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="documents-screen__dark-background">
                    <Dialog.Content className="add-file-form-content" aria-describedby={undefined}>
                        {showDiscardPopup ? (
                            <DiscardChangesPopup
                                onCancel={() => setShowDiscardPopup(false)}
                                onConfirm={onClose}
                            />
                        ) : (
                            <form className={`add-file-form ${className ?? ""}`}>
                                <div className="add-file-form__header">
                                    {/* one key per file type rather than "Add " + a noun: the
                                    heading is a sentence, and gluing a verb to a translated
                                    noun does not survive a language with cases */}
                                    <p className="add-file-form__heading">
                                        {t(`documents.addFileTitle.${fileType}`)}
                                    </p>
                                    <Dialog.Close asChild>
                                        <button className="add-file-form__close-btn" type="button">
                                            <img
                                                className="add-file-form__close-icon"
                                                src={closeIcon}
                                                alt={t("close")}
                                            />
                                        </button>
                                    </Dialog.Close>
                                </div>
                                <div className="add-file-form__main">
                                    <FileUpload
                                        className="add-file-form__file-upload"
                                        files={file ? [file] : null}
                                        onFilesSelected={handleFileSelect}
                                        accept={accept}
                                        formatsLabel={formatsLabel}
                                    />
                                    {(!!errorMsg || addImgErrorMsg) && (
                                        <div className="add-file-form__error-block">
                                            <img src={alertIcon} alt="" aria-hidden="true" />
                                            <p className="add-file-form__error-message">
                                                {errorMsg || addImgErrorMsg}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="add-file-form__btns-container">
                                    <Dialog.Close asChild>
                                        <button
                                            className="add-file-form__btn add-file-form__btn_cancel"
                                            type="button"
                                        >
                                            {t("cancel")}
                                        </button>
                                    </Dialog.Close>
                                    <button
                                        className="add-file-form__btn add-file-form__btn_save"
                                        type="button"
                                        disabled={!file || !fileKey}
                                        onClick={handleClick}
                                    >
                                        {t("save")}
                                    </button>
                                </div>
                            </form>
                        )}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default AddFileForm;
