import * as Sentry from "@sentry/react";
import { useT } from "@/i18n/use-t";
import { useEffect, useRef, useState } from "react";
import FileSection from "./components/file-section";
import AddFileForm from "./components/add-file-form";
import FileDeleteDialog from "./components/file-delete-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toats";
import { useDebounce } from "@/hooks/use-debounce";
import { downloadFile } from "@/utils/download-file";
import s3Service from "@/services/s3-service/s3-service";
import userService from "@/services/user-service/user-service";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "react-toastify";

type FileType = "cv" | "portfolio" | "cover_letter" | "other";

type FormData = {
    type: FileType;
};

type DeleteFileData = {
    id: number;
    name: string;
    type: FileType;
};

function DocumentsScreen() {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const { data: user, isLoading, refetch: refetchUser } = useCurrentUser();
    const [addFileFormData, setAddFileFormData] = useState<FormData | null>(null);
    const [deleteFileData, setDeleteFileData] = useState<DeleteFileData | null>(null);
    const [coverLetter, setCoverLetter] = useState<string>("");
    const { message: errorMsg, showToast } = useToast();
    const letterChanged = useRef(false);
    const coverLetterDebounce = useDebounce(coverLetter, 1000);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isLoading) setCoverLetter(user?.coverLetter ?? "");
    }, [user?.coverLetter, isLoading]);

    useEffect(() => {
        if (!letterChanged.current) return;

        letterChanged.current = false;
        handleCoverLetterChange();
    }, [coverLetterDebounce, user?.coverLetter]);

    const handleAddClick = (type: FileType) => {
        setAddFileFormData({ type });
    };

    const handleFileSelect = async (file: File) => {
        const { key, url } = await userService.getPresign({
            mimeType: file.type,
            type: addFileFormData?.type as string,
            size: file.size,
        });

        await s3Service.putFile({ file, url });

        return key;
    };

    const handleAddFormClick = async (pl: { file: File; key: string }) => {
        try {
            await userService.postUserFile({
                key: pl.key,
                mimeType: pl.file.type,
                type: addFileFormData?.type as string,
                name: pl.file.name,
            });

            setAddFileFormData(null);
            await refetchUser();
        } catch (e) {
            showToast(tErrors("generic.tryAgainSoon"));
            Sentry.captureException(e);
        }
    };

    const handleDownloadClick = async (pl: { key: string; name: string }) => {
        try {
            await downloadFile(pl.name, pl.key);
        } catch (e) {
            showToast(tErrors("generic.tryAgainSoon"));
            Sentry.captureException(e);
        }
    };

    const handleDeleteClick = (pl: DeleteFileData) => {
        setDeleteFileData(pl);
    };

    const handleCoverLetterChange = async () => {
        try {
            const payload = coverLetterDebounce ? coverLetterDebounce : null;

            await userService.patchCoverLetter(payload);
            queryClient.setQueryData<{ coverLetter: string }>(["me"], (i) => {
                if (!i) return i;

                return { ...i, coverLetter };
            });
        } catch (e) {
            toast.error(tErrors("generic.tryAgainSoon"));
            Sentry.captureException(e);
        }
    };

    const onCoverLetterChange = (letter: string) => {
        letterChanged.current = true;
        setCoverLetter(letter);
    };

    if (!user) return;

    const cvFiles = user.documents.filter((i) => i.type === "cv");
    const portfolioFiles = user.documents.filter((i) => i.type === "portfolio");
    const coverLetterFiles = user.documents.filter((i) => i.type === "cover_letter");
    const otherFiles = user.documents.filter((i) => i.type === "other");

    return (
        <div className="documents-screen">
            <div className="documents-screen__header">
                <div className="documents-screen__emoji-container">📄</div>
                <div className="documents-screen__header-main">
                    <h2 className="documents-screen__heading">{t("documents.heading")}</h2>
                    <p className="documents-screen__description">{t("documents.description")}</p>
                </div>
            </div>
            <div className="documents-screen__main">
                <FileSection
                    label={t("documents.sections.cv")}
                    files={cvFiles}
                    onAddClick={() => handleAddClick("cv")}
                    onDownloadClick={handleDownloadClick}
                    onDeleteClick={handleDeleteClick}
                />
                <FileSection
                    label={t("documents.sections.coverLetter")}
                    description={t("documents.coverLetterDescription")}
                    isCoverLetter
                    coverLetter={coverLetter}
                    files={coverLetterFiles}
                    onAddClick={() => handleAddClick("cover_letter")}
                    onDownloadClick={handleDownloadClick}
                    onDeleteClick={handleDeleteClick}
                    onCoverLetterChange={onCoverLetterChange}
                />
                <FileSection
                    label={t("documents.sections.portfolio")}
                    description={t("documents.portfolioDescription")}
                    files={portfolioFiles}
                    onAddClick={() => handleAddClick("portfolio")}
                    onDownloadClick={handleDownloadClick}
                    onDeleteClick={handleDeleteClick}
                />
                <FileSection
                    label={t("documents.sections.other")}
                    files={otherFiles}
                    onAddClick={() => handleAddClick("other")}
                    onDownloadClick={handleDownloadClick}
                    onDeleteClick={handleDeleteClick}
                />
            </div>

            {!!addFileFormData && (
                <AddFileForm
                    addImgErrorMsg={errorMsg}
                    onClick={handleAddFormClick}
                    fileType={addFileFormData.type}
                    isOpen={!!addFileFormData.type}
                    onFileSelect={handleFileSelect}
                    onClose={() => setAddFileFormData(null)}
                />
            )}
            {!!deleteFileData && (
                <FileDeleteDialog
                    file={deleteFileData}
                    onDeleted={refetchUser}
                    onClose={() => setDeleteFileData(null)}
                />
            )}
        </div>
    );
}

export default DocumentsScreen;
