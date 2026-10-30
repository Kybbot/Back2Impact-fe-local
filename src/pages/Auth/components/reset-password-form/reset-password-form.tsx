import { useRef, useState, type ChangeEvent } from "react";
import { useT } from "@/i18n/use-t";

type Props = {
    className?: string;
    onClick: (email: string) => void;
};

const DEFAULT_BTN_CLASS = "reset-password-form__btn reset-password-form__btn_active";
const INACTIVE_BTN_CLASS = "reset-password-form__btn";

function ResetPasswordForm({ className, onClick }: Props) {
    const { t } = useT("auth");
    const { t: tErrors } = useT("errors");
    const inputRef = useRef<HTMLInputElement>(null);
    const [email, setEmail] = useState("");
    const [showLabel, setShowLabel] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [btnClass, setBtnClass] = useState(INACTIVE_BTN_CLASS);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        const isValid = e.target.checkValidity();

        if (isValid && showMsg) setShowMsg(false);

        changeBtnClass();
        setEmail(email);
    };

    const handleEmailBlur = () => {
        const isValid = inputRef.current?.checkValidity();
        const isEmpty = inputRef.current?.value?.length === 0;

        if (!isValid) setShowMsg(true);
        if (isEmpty) setShowLabel(false);
        else setShowLabel(true);
    };

    const handleEmailFocus = () => {
        if (!showLabel) setShowLabel(true);
    };

    const changeBtnClass = () => {
        const isValid = inputRef.current?.checkValidity();
        const newBtnClass = isValid ? DEFAULT_BTN_CLASS : INACTIVE_BTN_CLASS;

        setBtnClass(newBtnClass);
    };

    const handleClick = () => {
        const isValid = validate();

        if (isValid) onClick(email);
    };

    const validate = () => {
        const isValid = inputRef.current?.checkValidity();

        if (!isValid) setShowMsg(true);

        return isValid;
    };

    return (
        <form className={`reset-password-form ${className ?? ""}`}>
            <div className="reset-password-form__header">
                <h2 className="reset-password-form__heading">{t("resetPassword.heading")}</h2>
                <p className="reset-password-form__description">{t("resetPassword.description")}</p>
            </div>
            <div className="reset-password-form__input-block">
                {showLabel && <label className="reset-password-form__label">{t("fields.email")}</label>}
                <div className="reset-password-form__input-container">
                    <input
                        ref={inputRef}
                        className="reset-password-form__input"
                        required
                        type="email"
                        placeholder={t("fields.email")}
                        onChange={handleEmailChange}
                        onFocus={handleEmailFocus}
                        onBlur={handleEmailBlur}
                    />
                </div>
                {showMsg && <p className="reset-password-form__invalid-input-msg">{tErrors("validation.email")}</p>}
            </div>
            <button className={btnClass} type="button" onClick={handleClick}>
                {t("resetPassword.submit")}
            </button>
            <hr className="reset-password-form__line" />
            <p className="reset-password-form__bottom-text">{t("checkEmail.spam")}</p>
        </form>
    );
}

export default ResetPasswordForm;
