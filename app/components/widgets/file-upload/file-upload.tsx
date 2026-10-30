import { useT } from "@/i18n/use-t";
import { useRef, useState, type MouseEvent } from "react";

type FileUploadProps = {
    className?: string;
    onFilesSelected: (files: File[]) => void;
    files: File[] | null;
    multiple?: boolean;
    accept?: string;
    maxFileSize?: number;
    formatsLabel?: string;
};

export function FileUpload({
    className,
    onFilesSelected,
    files,
    multiple = false,
    accept,
    formatsLabel,
}: FileUploadProps) {
    const { t } = useT("common");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;

        const files = Array.from(fileList);

        onFilesSelected(files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset, so picking the same file again still fires `change` — after a
        // rejected file that is exactly what the user is likely to do.
        e.target.value = "";
    };

    const openFileExplorer = () => {
        inputRef.current?.click();
    };

    const fileDropped = !!files && files.length !== 0;
    const ownClassName = "file-upload" + (fileDropped ? " file-upload__dropped" : "");
    const onDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        onFilesSelected([]);
    };

    const uiFormats = formatsLabel ?? "PDF, DOC, DOCX";

    return (
        <div
            className={`${ownClassName} ${className}`}
            onClick={openFileExplorer}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: `1px dashed ${isDragging ? "#4f46e5" : "#d1d5db"}`,
            }}
        >
            <p className="file-upload__dragndrop-str">{t("fileUpload.dragDrop")}</p>
            <p className="file-upload__or-str">{t("fileUpload.or")}</p>
            <div className="file-upload__btn-container">
                <button className="file-upload__btn" type="button">
                    {t("fileUpload.select")}
                </button>
                {fileDropped ? (
                    <p className="file-upload__file-name">{files[0].name}</p>
                ) : (
                    <p className="file-upload__formats-str">{uiFormats}</p>
                )}
            </div>

            <button className="file-upload__delete-btn" type="button" onClick={onDeleteClick}>
                {t("fileUpload.delete")}
            </button>

            <input
                ref={inputRef}
                type="file"
                hidden
                multiple={multiple}
                accept={accept}
                onChange={handleInputChange}
            />
        </div>
    );
}
