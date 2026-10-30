import { useRef, useState } from "react";
import { useT } from "@/i18n/use-t";
import type { PasswordInputRef } from "./types";
import PasswordInput from "@/components/shared/password-input/password-input";

type Props = {
    className?: string;
    onClick: (password: string) => Promise<void> | void;
};

const DEFAULT_BTN_CLASS = "set-new-password-form__btn set-new-password-form__btn_active";
const INACTIVE_BTN_CLASS = "set-new-password-form__btn";

function SetNewPasswordForm({ className, onClick }: Props) {
    const { t } = useT("auth");
    const { t: tErrors } = useT("errors");
    const passwordInputRef = useRef<PasswordInputRef>(null);
    const confirmPasswordInputRef = useRef<PasswordInputRef>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsValid, setPasswordsValid] = useState(false);
    const [btnClass, setBtnClass] = useState(INACTIVE_BTN_CLASS);

    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = (value: string) => {
        changeBtnClass();
        setPassword(value);

        const isValid = passwordInputRef.current?.checkValidity();
        const passwordsEqual = value === confirmPassword;
        const passwordsValid = passwordsEqual && !!isValid;

        if (passwordsEqual) confirmPasswordInputRef.current?.makeValid();

        setPasswordsValid(passwordsValid);
    };

    const handleConfirmPasswordChange = (value: string) => {
        changeBtnClass();
        setConfirmPassword(value);

        const isValid = confirmPasswordInputRef.current?.checkValidity();
        const passwordsEqual = value === password;
        const passwordsValid = passwordsEqual && !!isValid;

        if (passwordsEqual && isValid) setPasswordsValid(true);

        setPasswordsValid(passwordsValid);
    };

    const handlePasswordBlur = () => {
        const isValid = passwordInputRef.current?.checkValidity();

        if (!isValid) passwordInputRef.current?.invalidate(tErrors("validation.password"));
    };

    const handleConfirmPasswordBlur = () => {
        const value = confirmPasswordInputRef.current?.getValue() as string;

        if (value !== password) confirmPasswordInputRef.current?.invalidate(tErrors("validation.passwordsMatch"));
    };

    const changeBtnClass = () => {
        const isValid = validateSoft();
        const newBtnClass = isValid ? DEFAULT_BTN_CLASS : INACTIVE_BTN_CLASS;

        setBtnClass(newBtnClass);
    };

    const validateSoft = () => {
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const password = passwordInputRef.current?.getValue();
        const confirmPassword = confirmPasswordInputRef.current?.getValue();
        const passwordsAreEqual = password === confirmPassword;
        const allValid = !!passwordIsValid && passwordsAreEqual;

        return allValid;
    };

    const validate = () => {
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const password = passwordInputRef.current?.getValue();
        const confirmPassword = confirmPasswordInputRef.current?.getValue();
        const passwordsAreEqual = password === confirmPassword;
        const allValid = !!passwordIsValid && passwordsAreEqual;

        if (!passwordIsValid) passwordInputRef.current?.invalidate(tErrors("validation.password"));

        if (!passwordsAreEqual) confirmPasswordInputRef.current?.invalidate(tErrors("validation.passwordsMatch"));

        return allValid;
    };

    const handleClick = async () => {
        const isValid = validate();

        if (isValid) {
            setIsLoading(true);
            await onClick(password);
            setIsLoading(false);
        }
    };

    return (
        <form className={`set-new-password-form ${className ?? ""}`}>
            <div className="set-new-password-form__header">
                <h2 className="set-new-password-form__heading">{t("setNewPassword.heading")}</h2>
                <p className="set-new-password-form__description">{t("setNewPassword.description")}</p>
            </div>
            <div className="sign-up-form__main">
                <PasswordInput
                    ref={passwordInputRef}
                    inputType="password"
                    isOk={passwordsValid}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                />
                <PasswordInput
                    ref={confirmPasswordInputRef}
                    inputType="confirm_password"
                    originalPassword={password}
                    isOk={passwordsValid}
                    onChange={handleConfirmPasswordChange}
                    onBlur={handleConfirmPasswordBlur}
                />
            </div>
            <button
                className={`
                ${btnClass}
                ${isLoading ? "set-new-password-form__btn_active-loader" : ""}
            `}
                type="button"
                onClick={handleClick}
            >
                {t("setNewPassword.submit")}
            </button>
        </form>
    );
}

export default SetNewPasswordForm;
