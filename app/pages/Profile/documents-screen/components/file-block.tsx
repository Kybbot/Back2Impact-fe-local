import { useFormatRelativeDate } from "@/utils/format-relative-date";
import { useT } from "@/i18n/use-t";
import type { FileType } from "../types";
import closeIcon from "/img/close-icon-2.svg";

type FileData = {
    id: number;
    name: string;
    key: string;
    createdAt: string | Date;
    type: FileType;
};

type Props = {
    file: FileData;
    onDownloadClick: (f: FileData) => void;
    onDeleteClick: (f: FileData) => void;
};

function FileBlock({ file, onDownloadClick, onDeleteClick }: Props) {
    const { t } = useT("profile");
    const formatRelativeDate = useFormatRelativeDate();

    return (
        <div className="documents-screen__file">
            <div className="documents-screen__bar"></div>
            <div className="documents-screen__file-main">
                <p className="documents-screen__file-name">{file.name}</p>
                <p className="documents-screen__file-description" suppressHydrationWarning>
                    {t("documents.uploaded", { date: formatRelativeDate(file.createdAt) })}
                </p>
            </div>
            <div className="documents-screen__file-controls">
                <button
                    className="documents-screen__download-file-btn"
                    type="button"
                    onClick={() => onDownloadClick(file)}
                >
                    {t("documents.download")}
                </button>
                <button
                    className="documents-screen__delete-file-btn"
                    type="button"
                    onClick={() => onDeleteClick(file)}
                >
                    <img src={closeIcon} alt={t("documents.deleteFile")} />
                </button>
            </div>
        </div>
    );
}

export default FileBlock;
