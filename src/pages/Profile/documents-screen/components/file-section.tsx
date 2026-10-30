import { useT } from "@/i18n/use-t";
import type { FileType } from "../types";
import FileBlock from "./file-block";
import plusIcon from "/img/blue-plus-icon.svg";

type FileData = {
    id: number;
    name: string;
    key: string;
    createdAt: string | Date;
    type: FileType;
};

type Props = {
    label: string;
    description?: string;
    isCoverLetter?: boolean;
    coverLetter?: string;
    files: FileData[];
    onAddClick: () => void;
    onDownloadClick: (f: FileData) => void;
    onDeleteClick: (f: FileData) => void;
    onCoverLetterChange?: (cl: string) => void;
};

function FileSection({
    label,
    description,
    isCoverLetter,
    coverLetter,
    files,
    onAddClick,
    onDownloadClick,
    onDeleteClick,
    onCoverLetterChange,
}: Props) {
    const { t } = useT("profile");
    return (
        <div className="documents-screen__file-section">
            <div className="documents-screen__file-section-header">
                <div className="documents-screen__file-section-header-main">
                    <p className="documents-screen__file-section-heading">{label}</p>
                    <button className="documents-screen__add-file-btn" type="button" onClick={onAddClick}>
                        <span>{t("common.add")}</span>
                        <img
                            className="documents-screen__add-icon"
                            src={plusIcon}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                </div>
                {description && <p className="documents-screen__description">{description}</p>}
            </div>
            {isCoverLetter && (
                <textarea
                    className="documents-screen__letter-text-area"
                    placeholder={t("documents.coverLetterPlaceholder")}
                    value={coverLetter}
                    onChange={(e) => onCoverLetterChange?.(e.target.value)}
                ></textarea>
            )}
            {files.length !== 0 && (
                <div className="documents-screen__file-container">
                    {files.map((i, index) => (
                        <FileBlock
                            key={index}
                            file={i}
                            onDownloadClick={onDownloadClick}
                            onDeleteClick={onDeleteClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FileSection;
