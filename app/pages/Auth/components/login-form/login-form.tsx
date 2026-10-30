import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent, type Ref } from "react";
import { useT } from "@/i18n/use-t";
import eyeIcon from "/img/eye-show-icon.svg";
import eyeOffIcon from "/img/eye-off-icon.svg";

type Props = {
    className?: string;
    onClick: (pl: { email: string; password: string }) => Promise<void> | void;
};
type Handle = { invalidate: () => void };

const DEFAULT_BTN_CLASS = "login-form__btn login-form__btn_active";
const INACTIVE_BTN_CLASS = "login-form__btn";

function LoginForm({ className, onClick }: Props, ref: Ref<Handle>) {
    const { t } = useT("auth");
    const { t: tErrors } = useT("errors");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [btnClass, setBtnClass] = useState(INACTIVE_BTN_CLASS);
    const [showPassword, setShowPassword] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const [showEmailLabel, setShowEmailLabel] = useState(false);
    const [showPasswordLabel, setShowPasswordLabel] = useState(false);

    const [showEmailMsg, setShowEmailMsg] = useState(false);
    const [showPasswordMsg, setShowPasswordMsg] = useState(false);
    const [showEyeImg, setShowEyeImg] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        invalidate: () => setIsInvalid(true),
    }));

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        const isValid = e.target.checkValidity();

        if (isInvalid) setIsInvalid(false);
        if (isValid && showEmailMsg) setShowEmailMsg(false);

        changeBtnClass();
        setEmail(email);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        const isValid = e.target.checkValidity();

        if (isInvalid) setIsInvalid(false);
        if (isValid && showPasswordMsg) setShowPasswordMsg(false);

        changeBtnClass();
        setPassword(password);
    };

    const handleClick = async () => {
        const isValid = validate();

        if (isValid) {
            setIsLoading(true);
            await onClick({ email, password });
            setIsLoading(false);
        }
    };

    const validate = () => {
        const emailIsValid = emailInputRef.current?.checkValidity();
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const allValid = !!emailIsValid && !!passwordIsValid;

        if (!emailIsValid) setShowEmailMsg(true);

        if (!passwordIsValid) setShowPasswordMsg(true);

        return allValid;
    };

    const handleEmailBlur = () => {
        const isValid = emailInputRef.current?.checkValidity();
        const isEmpty = emailInputRef.current?.value.length === 0;

        if (!isValid) setShowEmailMsg(true);
        setShowEmailLabel(!isEmpty);
    };

    const handlePasswordBlur = () => {
        const isValid = passwordInputRef.current?.checkValidity();
        const isEmpty = passwordInputRef.current?.value.length === 0;

        if (!isValid) setShowPasswordMsg(true);
        setShowPasswordLabel(!isEmpty);
        setShowEyeImg(false);
    };

    const handleEmailFocus = () => {
        if (!showEmailLabel) setShowEmailLabel(true);
    };

    const handlePasswordFocus = () => {
        setShowEyeImg(true);

        if (!showPasswordLabel) setShowPasswordLabel(true);
    };

    const validateSoft = () => {
        const emailIsValid = emailInputRef.current?.checkValidity();
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const allValid = !!emailIsValid && !!passwordIsValid;

        return allValid;
    };

    const changeBtnClass = () => {
        const isValid = validateSoft();
        const newBtnClass = isValid ? DEFAULT_BTN_CLASS : INACTIVE_BTN_CLASS;

        setBtnClass(newBtnClass);
    };

    return (
        <form className={`login-form ${className}`}>
            <div className="login-form__main">
                <div className="login-form__input-block">
                    {showEmailLabel && (
                        <label
                            className={`login-form__label ${isInvalid ? "login-form__label_invalid" : ""}`}
                        >
                            {t("fields.email")}
                        </label>
                    )}
                    <div className={`login-form__input-container`}>
                        <input
                            ref={emailInputRef}
                            className={`login-form__input ${isInvalid ? "login-form__input_invalid" : ""}`}
                            required
                            type="email"
                            placeholder={t("fields.email")}
                            onChange={handleEmailChange}
                            onFocus={handleEmailFocus}
                            onBlur={handleEmailBlur}
                        />
                    </div>
                    {showEmailMsg && <p className="login-form__invalid-input-msg">{tErrors("validation.email")}</p>}
                </div>
                <div className="login-form__input-block">
                    {showPasswordLabel && (
                        <label
                            className={`login-form__label ${isInvalid ? "login-form__label_invalid" : ""}`}
                        >
                            {t("fields.password")}
                        </label>
                    )}
                    <div className={`login-form__input-container`}>
                        <input
                            ref={passwordInputRef}
                            className={`login-form__input ${isInvalid ? "login-form__input_invalid" : ""}`}
                            type={showPassword ? "text" : "password"}
                            pattern="(?=.*[A-Z])(?=.*\d).{8,}"
                            required
                            minLength={8}
                            placeholder={t("fields.password")}
                            onChange={handlePasswordChange}
                            onFocus={handlePasswordFocus}
                            onBlur={handlePasswordBlur}
                        />
                        {showEyeImg && (
                            <button
                                className="login-form__input-icon-btn"
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowPassword((p) => !p)}
                            >
                                <img
                                    src={showPassword ? eyeIcon : eyeOffIcon}
                                    className="sign-up-form__input-icon"
                                    alt=""
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>
                    {showPasswordMsg && (
                        <p className="login-form__invalid-input-msg">{tErrors("validation.password")}</p>
                    )}
                    {isInvalid && (
                        <p className="login-form__invalid-message">{tErrors("auth.wrongCredentials")}</p>
                    )}
                </div>
            </div>
            <button
                className={`
                ${btnClass}
                ${isLoading && "login-form__btn_loader"}    
            `}
                type="button"
                onClick={handleClick}
            >
                {t("login.submit")}
            </button>
        </form>
    );
}

export default forwardRef<Handle, Props>(LoginForm);
