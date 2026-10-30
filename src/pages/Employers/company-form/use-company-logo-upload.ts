import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";

import { useT } from "@/i18n/use-t";

import {
    COMPANY_LOGO_MAX_SIZE,
    COMPANY_LOGO_MIME_TYPES,
    type CompanyLogoMimeType,
} from "@/services/employer-service/types";
import { usePutFile } from "@/services/s3-service";
import { usePostCompanyLogo } from "@/services/employer-service";

const isLogoMimeType = (type: string): type is CompanyLogoMimeType =>
    (COMPANY_LOGO_MIME_TYPES as readonly string[]).includes(type);

/**
 * Uploads a picked logo straight to S3 and hands its key to the form.
 * `savedUrl` is the logo the company already has; it is shown until a new
 * file replaces it.
 */
export function useCompanyLogoUpload(onUploaded: (key: string) => void, savedUrl: string | null = null) {
    const { t } = useT("errors");

    const putFile = usePutFile();
    const postCompanyLogo = usePostCompanyLogo();

    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const select = async (file: File) => {
        setError(null);

        if (!isLogoMimeType(file.type)) return setError(t("employers.logo.invalidType"));
        if (file.size > COMPANY_LOGO_MAX_SIZE) return setError(t("employers.logo.tooLarge"));

        try {
            const { url, key } = await postCompanyLogo.mutateAsync({ mimeType: file.type, size: file.size });

            await putFile.mutateAsync({ file, url });

            onUploaded(key);
            setBlobUrl(URL.createObjectURL(file));
        } catch (e) {
            setError(t("employers.logo.uploadFailed"));
            Sentry.captureException(e);
        }
    };

    // the preview is a blob url of the local file; released once it is replaced or the form is left
    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    return {
        error,
        select,
        previewUrl: blobUrl ?? savedUrl,
        isUploading: postCompanyLogo.isPending || putFile.isPending,
    };
}
