import type { FieldPath } from "react-hook-form";
import * as z from "zod";

export type FormValues = {
    audienceSegment?: string | undefined;
    opportunityTypes?: string[] | undefined;
    sectors?: string[] | undefined;
    professionalAreas?: string[] | undefined;
    basedCountry?: string | undefined;
    workLocationPreference?: string | undefined;
    locations?: { region?: string | undefined; cities?: string[] | null | undefined }[] | undefined;
    cv?: z.core.File | null | undefined;
};

export type Step = {
    id: string;
    path: string;
    fields: FieldPath<FormValues>[];
    isComplete: (values: FormValues) => boolean;
};
