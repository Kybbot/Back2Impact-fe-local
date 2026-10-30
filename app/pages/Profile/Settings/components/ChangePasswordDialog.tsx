import { useT } from "@/i18n/use-t";
import { useRef, useState, type ChangeEvent, type FC } from "react";
import { Dialog } from "radix-ui";

import ErrorBlock from "../../../../components/shared/error-block/error-block";
import PasswordInput from "../../../../components/shared/password-input/password-input";
import DiscardChangesPopup from "../../../../components/shared/discard-changes-popup/discard-changes-popup";

import { useChangeUserPassword } from "../hooks/useChangeUserPassword";

import type { PasswordInputRef } from "../../../Auth/components/sign-up-form/types";

type Props = {
    triggerClassName?: string;
};

export const ChangePasswordDialog: FC<Props> = ({ triggerClassName = "settings__btn" }) => {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const oldPasswordInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<PasswordInputRef>(null);
    const confirmPasswordInputRef = useRef<PasswordInputRef>(null);

    const [open, setOpen] = useState(false);
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [showOldPasswordMsg, setShowOldPasswordMsg] = useState(false);
    const [showOldPasswordLabel, setShowOldPasswordLabel] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsValid, setPasswordsValid] = useState(false);

    const { isPending, isError, mutate, reset: resetMutation } = useChangeUserPassword();

    const handleOldPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        const isValid = e.target.checkValidity();

        if (isValid && showOldPasswordMsg) setShowOldPasswordMsg(false);

        setOldPassword(email);
    };

    const handleOldPasswordFocus = () => {
        if (!showOldPasswordLabel) setShowOldPasswordLabel(true);
    };

    const handleOldPasswordBlur = () => {
        const isValid = oldPasswordInputRef.current?.checkValidity();
        const isEmpty = oldPasswordInputRef.current?.value?.length === 0;

        if (isEmpty) setShowOldPasswordLabel(false);
        if (!isValid) setShowOldPasswordMsg(true);
        else setShowOldPasswordLabel(true);
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);

        const isValid = passwordInputRef.current?.checkValidity();
        const passwordsEqual = value === confirmPassword;
        const passwordsValid = passwordsEqual && !!isValid;

        if (passwordsEqual) confirmPasswordInputRef.current?.makeValid();

        setPasswordsValid(passwordsValid);
    };

    const handlePasswordBlur = () => {
        const isValid = passwordInputRef.current?.checkValidity();

        if (!isValid) passwordInputRef.current?.invalidate(tErrors("validation.password"));
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);

        const isValid = confirmPasswordInputRef.current?.checkValidity();
        const passwordsEqual = value === password;
        const passwordsValid = passwordsEqual && !!isValid;

        if (passwordsEqual && isValid) setPasswordsValid(true);

        setPasswordsValid(passwordsValid);
    };

    const handleConfirmPasswordBlur = () => {
        const value = confirmPasswordInputRef.current?.getValue() as string;

        if (value !== password)
            confirmPasswordInputRef.current?.invalidate(tErrors("validation.passwordsMatch"));
    };

    const validate = () => {
        const oldPasswordIsValid = oldPasswordInputRef.current?.checkValidity();
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const password = passwordInputRef.current?.getValue();
        const confirmPassword = confirmPasswordInputRef.current?.getValue();
        const passwordsAreEqual = password === confirmPassword;
        const allValid = !!oldPasswordIsValid && !!passwordIsValid && passwordsAreEqual;

        if (!oldPasswordIsValid) setShowOldPasswordMsg(true);

        if (!passwordIsValid) passwordInputRef.current?.invalidate(tErrors("validation.password"));

        if (!passwordsAreEqual)
            confirmPasswordInputRef.current?.invalidate(tErrors("validation.passwordsMatch"));

        return allValid;
    };

    const resetForm = () => {
        setOldPassword("");
        setShowOldPasswordMsg(false);
        setShowOldPasswordLabel(false);
        setPassword("");
        setConfirmPassword("");
        setPasswordsValid(false);
        // the dialog stays mounted, so a failed save would still show on the next opening
        resetMutation();
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    // Esc, outside click and both Dialog.Close buttons all end up here
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            // hidden on open rather than on close, so the popup doesn't flip back
            // to the form while the dialog is still animating out
            setShowDiscardPopup(false);
            setOpen(true);
        } else if (oldPassword || password || confirmPassword) setShowDiscardPopup(true);
        else handleClose();
    };

    const handleClick = () => {
        const isValid = validate();

        if (isValid) {
            mutate(
                { body: { currentPassword: oldPassword, password: password } },
                {
                    onSuccess() {
                        handleClose();
                    },
                },
            );
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Trigger asChild>
                <button type="button" className={triggerClassName}>
                    {t("password.change")}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="settingsDialog__overlay" />
                <Dialog.Content
                    className={`settingsDialog__content ${showDiscardPopup ? "settingsDialog__content--popup" : ""}`}
                >
                    {showDiscardPopup && (
                        <DiscardChangesPopup
                            onCancel={() => setShowDiscardPopup(false)}
                            onConfirm={handleClose}
                        />
                    )}
                    {/* hidden rather than unmounted: the inputs are uncontrolled,
                    so remounting them would wipe what the user has typed */}
                    <div className="settingsDialog__form" hidden={showDiscardPopup}>
                        <div className="settingsDialog__header">
                            <Dialog.Title className="settingsDialog__title">
                                {t("password.changeTitle")}
                            </Dialog.Title>
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
                        <div className="settingsDialog__main settingsDialog__main--grid">
                            <div className="sign-up-form__input-block">
                                {showOldPasswordLabel && (
                                    <label className="sign-up-form__label">{t("password.old")}</label>
                                )}
                                <div className="sign-up-form__input-container">
                                    <input
                                        required
                                        type="password"
                                        ref={oldPasswordInputRef}
                                        placeholder={t("password.old")}
                                        onBlur={handleOldPasswordBlur}
                                        className="sign-up-form__input"
                                        onFocus={handleOldPasswordFocus}
                                        onChange={handleOldPasswordChange}
                                    />
                                </div>
                                {showOldPasswordMsg && (
                                    <p className="sign-up-form__invalid-input-msg">
                                        {tErrors("profile.oldPasswordRequired")}
                                    </p>
                                )}
                            </div>
                            <PasswordInput
                                inputType="password"
                                isOk={passwordsValid}
                                ref={passwordInputRef}
                                onBlur={handlePasswordBlur}
                                onChange={handlePasswordChange}
                            />
                            <PasswordInput
                                isOk={passwordsValid}
                                originalPassword={password}
                                inputType="confirm_password"
                                ref={confirmPasswordInputRef}
                                onBlur={handleConfirmPasswordBlur}
                                onChange={handleConfirmPasswordChange}
                            />
                        </div>
                        {isError && (
                            <ErrorBlock
                                className="settingsDialog__error"
                                message={tErrors("generic.tryAgainSoon")}
                            />
                        )}
                        <div className="settingsDialog__footer">
                            <Dialog.Close asChild>
                                <button type="button" disabled={isPending} className="settingsDialog__btn">
                                    {t("cancel")}
                                </button>
                            </Dialog.Close>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleClick}
                                className="settingsDialog__btn settingsDialog__btn--active"
                            >
                                {t("password.changeTitle")}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
