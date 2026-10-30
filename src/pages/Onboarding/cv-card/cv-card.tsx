import { Controller, useFormContext } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { FileUpload } from "../../../components/widgets/file-upload/file-upload";
import CardHeader from "../components/card-header/card-header";

type Props = { className?: string };
type FormContext = { cv: File | null };

const MAX_FILE_SIZE = 1024 * 1024 * 10;
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function CvCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { t: tErrors } = useT("errors");
    const { setValue, setError, clearErrors, control } = useFormContext<FormContext>();

    const handleFileSelect = (files: File[]) => {
        if (!files.length) {
            setValue("cv", null);
            clearErrors("cv");

            return;
        }

        const file = files[0];

        // The rejected file is not kept as the form value: otherwise the card
        // would show its name next to the error, and `Next` would upload it.
        if (file.size > MAX_FILE_SIZE) {
            setValue("cv", null);
            setError("cv", {
                type: "manual",
                message: tErrors("file.tooBig"),
            });

            return;
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setValue("cv", null);
            setError("cv", {
                type: "manual",
                message: tErrors("file.invalidFormat"),
            });

            return;
        }

        setValue("cv", file);
        clearErrors("cv");
    };

    return (
        <div className={`cv-card ${className ?? ""}`}>
            <CardHeader
                className="cv-card__header"
                heading={t("cv.heading")}
                description={t("cv.description")}
            />

            <Controller
                name="cv"
                control={control}
                render={({ field }) => (
                    <FileUpload
                        accept=".pdf, .doc, .docx"
                        multiple={false}
                        files={field.value ? [field.value] : []}
                        onFilesSelected={handleFileSelect}
                    />
                )}
            />
        </div>
    );
}

export default CvCard;
