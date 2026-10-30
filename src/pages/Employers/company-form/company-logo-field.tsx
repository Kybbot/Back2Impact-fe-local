import { useRef, type ChangeEvent } from "react";

import { useT } from "@/i18n/use-t";

import { COMPANY_LOGO_MIME_TYPES } from "@/services/employer-service/types";

type Props = {
    error: string | null;
    /** shown in place of the logo until one is uploaded */
    initials: string;
    isUploading: boolean;
    previewUrl: string | null;
    onSelect: (file: File) => void;
};

function CompanyLogoField({ previewUrl, initials, isUploading, error, onSelect }: Props) {
    const { t } = useT("employers");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // cleared so that picking the same file again still fires `change`
        e.target.value = "";

        if (file) onSelect(file);
    };

    const getBtnText = () => {
        if (isUploading) return t("setup.logo.uploading");
        if (previewUrl) return t("setup.logo.replace");

        return t("setup.logo.upload");
    };

    return (
        <div className="company-logo-field">
            <p className="company-form__label">{t("setup.logo.label")}</p>
            <div className="company-logo-field__body">
                <div className="company-logo-field__preview">
                    {previewUrl ? (
                        <img className="company-logo-field__img" src={previewUrl} alt={t("setup.logo.alt")} />
                    ) : (
                        <span className="company-logo-field__initials" aria-hidden="true">
                            {initials}
                        </span>
                    )}
                </div>
                <div className="company-logo-field__controls">
                    <button
                        type="button"
                        className="company-logo-field__btn"
                        disabled={isUploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        {getBtnText()}
                        {!isUploading && (
                            <svg
                                width="16"
                                height="16"
                                fill="none"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeWidth="1.3"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 4V12M4 8H12"
                                />
                            </svg>
                        )}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={COMPANY_LOGO_MIME_TYPES.join(",")}
                        hidden
                        onChange={handleChange}
                    />
                    <p className="company-logo-field__hint">{t("setup.logo.hint")}</p>
                    {error && (
                        <p role="alert" className="company-logo-field__error">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CompanyLogoField;
