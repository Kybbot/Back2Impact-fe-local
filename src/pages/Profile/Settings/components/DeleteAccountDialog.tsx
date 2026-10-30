import { useT } from "@/i18n/use-t";
import { useState, type FC } from "react";
import { Dialog } from "radix-ui";
import { useQueryClient } from "@tanstack/react-query";

import { Checkbox } from "../../../../components/shared/checkbox/checkbox";

import { clearSession } from "../../../../hooks/use-auth-mutations";
import { useDeleteAccount } from "../hooks/useDeleteAccount";

export const DeleteAccountDialog: FC = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    const [check1, setCheck1] = useState(false);
    const [check2, setCheck2] = useState(false);
    const [check3, setCheck3] = useState(false);
    const [check4, setCheck4] = useState(false);

    const [text, setText] = useState("");

    const { isPending, mutate } = useDeleteAccount();

    const handleCloseModal = () => {
        setCheck1(false);
        setCheck2(false);
        setCheck3(false);
        setCheck4(false);
        setText("");
    };

    const handleDelete = async () => {
        const reasons = [];

        if (check1) reasons.push("dont_use_platform");
        if (check2) reasons.push("matches_didnt_suit_me");
        if (check3) reasons.push("difficult_to_use");
        if (check4) reasons.push("dont_see_value");

        mutate(
            { body: { comment: text, reasons: reasons } },
            {
                onSuccess(data) {
                    // the API has already ended the session; forgetting the
                    // user here is what sends the visitor to the login page
                    if (data.message === "Success") clearSession(queryClient);
                },
            },
        );
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button type="button" className="settings__btn settings__btn--delete">
                    {t("deleteAccount.trigger")}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="settingsDialog__overlay" />
                <Dialog.Content
                    onEscapeKeyDown={handleCloseModal}
                    onInteractOutside={handleCloseModal}
                    className="settingsDialog__content"
                >
                    <div className="settingsDialog__header">
                        <Dialog.Title className="settingsDialog__title">
                            {t("deleteAccount.title")}
                        </Dialog.Title>
                        <Dialog.Description className="settingsDialog__description">
                            {t("deleteAccount.warning")}
                        </Dialog.Description>
                        <Dialog.Close asChild>
                            <button type="button" className="settingsDialog__close">
                                <svg
                                    width="13"
                                    height="13"
                                    fill="none"
                                    viewBox="0 0 13 13"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke="#333333"
                                        strokeWidth="1.5"
                                        strokeOpacity="0.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.75 0.75L0.75 11.75M11.75 11.75L0.75 0.75"
                                    />
                                </svg>
                            </button>
                        </Dialog.Close>
                    </div>
                    <div className="settingsDialog__main">
                        <p className="settingsDialog__text">
                            {t("deleteAccount.description")}
                            <span className="settingsDialog__text--grey"> (optional)</span>
                        </p>

                        <div className="settingsDialog__checkboxes">
                            <Checkbox
                                checked={check1}
                                label={t("deleteAccount.reasons.unused")}
                                onChange={(event) => setCheck1(event.target.checked)}
                            />
                            <Checkbox
                                checked={check2}
                                label={t("deleteAccount.reasons.matches")}
                                onChange={(event) => setCheck2(event.target.checked)}
                            />
                            <Checkbox
                                checked={check3}
                                label={t("deleteAccount.reasons.difficult")}
                                onChange={(event) => setCheck3(event.target.checked)}
                            />
                            <Checkbox
                                checked={check4}
                                label={t("deleteAccount.reasons.noValue")}
                                onChange={(event) => setCheck4(event.target.checked)}
                            />
                        </div>

                        <textarea
                            rows={4}
                            value={text}
                            placeholder={t("deleteAccount.reasons.other")}
                            className="settingsDialog__textarea"
                            onChange={(event) => setText(event.target.value)}
                        ></textarea>

                        <p className="settingsDialog__warning">
                            <svg
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12.0004 17.0004C12.2337 17.0004 12.4295 16.9212 12.5879 16.7629C12.7462 16.6046 12.8254 16.4087 12.8254 16.1754C12.8254 15.9421 12.7462 15.7462 12.5879 15.5879C12.4295 15.4296 12.2337 15.3504 12.0004 15.3504C11.767 15.3504 11.5712 15.4296 11.4129 15.5879C11.2545 15.7462 11.1754 15.9421 11.1754 16.1754C11.1754 16.4087 11.2545 16.6046 11.4129 16.7629C11.5712 16.9212 11.767 17.0004 12.0004 17.0004ZM11.3254 13.1754H12.8254V6.85037H11.3254V13.1754ZM12.0254 23.2754L8.65039 20.0004H4.00039V15.3504L0.650391 12.0004L4.00039 8.65037V4.00039H8.65039L12.0254 0.650391L15.3504 4.00039H20.0004V8.65037L23.3504 12.0004L20.0004 15.3504V20.0004H15.3504L12.0254 23.2754Z"
                                    fill="#FAC9C3"
                                />
                                <path
                                    d="M12.0008 16.9996C12.2341 16.9996 12.4299 16.9205 12.5883 16.7622C12.7466 16.6038 12.8258 16.408 12.8258 16.1746C12.8258 15.9413 12.7466 15.7455 12.5883 15.5871C12.4299 15.4288 12.2341 15.3496 12.0008 15.3496C11.7674 15.3496 11.5716 15.4288 11.4133 15.5871C11.2549 15.7455 11.1758 15.9413 11.1758 16.1746C11.1758 16.408 11.2549 16.6038 11.4133 16.7622C11.5716 16.9205 11.7674 16.9996 12.0008 16.9996ZM11.3258 13.1746H12.8258V6.84961H11.3258V13.1746Z"
                                    fill="#BB3220"
                                />
                            </svg>
                            {t("deleteAccount.irreversible")}
                        </p>
                    </div>

                    <div className="settingsDialog__footer">
                        <Dialog.Close asChild>
                            <button type="button" disabled={isPending} className="settingsDialog__btn">
                                {t("cancel")}
                            </button>
                        </Dialog.Close>
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={handleDelete}
                            className="settingsDialog__btn settingsDialog__btn--delete"
                        >
                            {t("deleteAccount.confirm")}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
