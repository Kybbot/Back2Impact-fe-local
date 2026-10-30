import z from "zod";
import type { TFunction } from "i18next";

import type {
    EmployerApplicationStatus,
    PatchEmployerApplicationStatusDTO,
} from "@/services/employer-service/types";

/** the statuses that email the candidate, so they are set through a form rather than straight away */
export type NotifyingStatus = Extract<EmployerApplicationStatus, "invited" | "hired" | "not_a_fit">;

export type StatusChangeFormValues = {
    message: string;
    replyTo: string;
    /** "invited" only */
    bookingLink: string;
    /** "not a fit" only: whether the candidate gets a note, with the employer's own line if there is one */
    sendShortNote: boolean;
};

export const createStatusChangeSchema = (t: TFunction<"errors">, status: NotifyingStatus) => {
    const required = t("validation.required");
    // "not a fit" has no reply-to field, the login email goes out as is; its line is optional
    const isNotAFit = status === "not_a_fit";

    return z.object({
        message: isNotAFit ? z.string().trim() : z.string().trim().min(1, required),
        replyTo: isNotAFit
            ? z.string()
            : z
                  .string()
                  .trim()
                  .min(1, required)
                  .refine(
                      (value) => !value || z.email().safeParse(value).success,
                      t("validation.email"),
                  ),
        bookingLink: z
            .string()
            .trim()
            .refine(
                (value) => !value || z.httpUrl().safeParse(value).success,
                t("employers.statusChange.link"),
            ),
        sendShortNote: z.boolean(),
    });
};

/** each status sends only the fields that belong to it; the optional ones are left out when empty */
export const toStatusChangeDTO = (
    id: number,
    status: NotifyingStatus,
    data: StatusChangeFormValues,
): PatchEmployerApplicationStatusDTO => {
    switch (status) {
        case "invited":
            return {
                id,
                status,
                message: data.message,
                replyTo: data.replyTo,
                bookingLink: data.bookingLink || undefined,
            };
        case "hired":
            return { id, status, message: data.message, replyTo: data.replyTo };
        case "not_a_fit":
            return {
                id,
                status,
                replyTo: data.replyTo,
                sendShortNote: data.sendShortNote,
                // the line belongs to the note, so it goes nowhere without it
                message: data.sendShortNote && data.message ? data.message : undefined,
            };
    }
};
