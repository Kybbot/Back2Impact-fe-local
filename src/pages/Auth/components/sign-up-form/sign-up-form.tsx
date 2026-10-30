import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent, type Ref } from "react";
import { Trans } from "react-i18next";
import { useT } from "@/i18n/use-t";
import { Checkbox } from "@/components/shared/form/Checkbox/Checkbox";
import PasswordInput from "../../../../components/shared/password-input/password-input";
import type { PasswordInputRef } from "./types";

// TODO: point to the real pages once they exist
const TERMS_URL = "/";
const PRIVACY_URL = "/";

type Props = {
    className?: string;
    /** the employer sign-up asks for the company as well */
    withCompanyName?: boolean;
    /** the employer sign-up asks to accept the terms and confirm the right to hire */
    withConsent?: boolean;
    onClick: (pl: {
        companyName?: string;
        fullName: string;
        email: string;
        password: string;
    }) => Promise<void> | void;
};

type Handle = {
    invalidate: () => void;
};

const DEFAULT_BTN_CLASS = "sign-up-form__btn sign-up-form__btn_active";
const INACTIVE_BTN_CLASS = "sign-up-form__btn";

// at least 2 characters once the surrounding spaces are trimmed, with at least one letter of any alphabet
const NAME_PATTERN = String.raw`(?=.*\p{L})\s*\S.*\S\s*`;

function AuthForm(
    { className, withCompanyName = false, withConsent = false, onClick }: Props,
    ref: Ref<Handle>,
) {
    const { t } = useT("auth");
    const { t: tErrors } = useT("errors");
    const [companyName, setCompanyName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [btnClass, setBtnClass] = useState(INACTIVE_BTN_CLASS);
    const [passwordsValid, setPasswordsValid] = useState(false);

    const [showCompanyNameLabel, setShowCompanyNameLabel] = useState(false);
    const [showFullNameLabel, setShowFullNameLabel] = useState(false);
    const [showEmailLabel, setShowEmailLabel] = useState(false);

    const [showCompanyNameMsg, setShowCompanyNameMsg] = useState(false);
    const [showFullNameMsg, setShowFullNameMsg] = useState(false);
    const [showEmailMsg, setShowEmailMsg] = useState(false);
    const [showConsentMsg, setShowConsentMsg] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const companyNameInputRef = useRef<HTMLInputElement>(null);
    const fullNameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<PasswordInputRef>(null);
    const confirmPasswordInputRef = useRef<PasswordInputRef>(null);

    useImperativeHandle(ref, () => ({ invalidate: () => {} }));

    const handleCompanyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const companyName = e.target.value;
        const isValid = e.target.checkValidity();

        if (isValid && showCompanyNameMsg) setShowCompanyNameMsg(false);

        changeBtnClass();
        setCompanyName(companyName);
    };

    const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const fullName = e.target.value;
        const isValid = e.target.checkValidity();

        if (isValid && showFullNameMsg) setShowFullNameMsg(false);

        changeBtnClass();
        setFullName(fullName);
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        const isValid = e.target.checkValidity();

        if (isValid && showEmailMsg) setShowEmailMsg(false);

        changeBtnClass();
        setEmail(email);
    };

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

    const handleConsentChange = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;

        if (checked && showConsentMsg) setShowConsentMsg(false);

        // the state is not updated yet, so the new value goes in explicitly
        changeBtnClass(checked);
        setConsentAccepted(checked);
    };

    const handleCompanyNameBlur = () => {
        const isValid = companyNameInputRef.current?.checkValidity();
        const isEmpty = companyNameInputRef.current?.value?.length === 0;

        if (!isValid) setShowCompanyNameMsg(true);
        if (isEmpty) setShowCompanyNameLabel(false);
        else setShowCompanyNameLabel(true);
    };

    const handleFullNameBlur = () => {
        const isValid = fullNameInputRef.current?.checkValidity();
        const isEmpty = fullNameInputRef.current?.value?.length === 0;

        if (!isValid) setShowFullNameMsg(true);
        if (isEmpty) setShowFullNameLabel(false);
        else setShowFullNameLabel(true);
    };

    const handleEmailBlur = () => {
        const isValid = emailInputRef.current?.checkValidity();
        const isEmpty = emailInputRef.current?.value?.length === 0;

        if (!isValid) setShowEmailMsg(true);
        if (isEmpty) setShowEmailLabel(false);
        else setShowEmailLabel(true);
    };

    const handlePasswordBlur = () => {
        const isValid = passwordInputRef.current?.checkValidity();

        if (!isValid) passwordInputRef.current?.invalidate(tErrors("validation.password"));
    };

    const handleConfirmPasswordBlur = () => {
        const value = confirmPasswordInputRef.current?.getValue() as string;

        if (value !== password) confirmPasswordInputRef.current?.invalidate(tErrors("validation.passwordsMatch"));
    };

    const handleCompanyNameFocus = () => {
        if (!showCompanyNameLabel) setShowCompanyNameLabel(true);
    };

    const handleFullNameFocus = () => {
        if (!showFullNameLabel) setShowFullNameLabel(true);
    };

    const handleEmailFocus = () => {
        if (!showEmailLabel) setShowEmailLabel(true);
    };

    const handleClick = async () => {
        const isValid = validate();

        if (isValid) {
            setIsLoading(true);
            await onClick(
                withCompanyName
                    ? { companyName: companyName.trim(), fullName: fullName.trim(), email, password }
                    : { fullName: fullName.trim(), email, password },
            );
            setIsLoading(false);
        }
    };

    const validate = () => {
        // the field is not rendered for candidates, so there is nothing to check
        const companyNameIsValid = !withCompanyName || !!companyNameInputRef.current?.checkValidity();
        const fullNameIsValid = fullNameInputRef.current?.checkValidity();
        const emailIsValid = emailInputRef.current?.checkValidity();
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const password = passwordInputRef.current?.getValue();
        const confirmPassword = confirmPasswordInputRef.current?.getValue();
        const passwordsAreEqual = password === confirmPassword;
        const consentIsValid = !withConsent || consentAccepted;
        const allValid =
            companyNameIsValid &&
            !!fullNameIsValid &&
            !!emailIsValid &&
            !!passwordIsValid &&
            passwordsAreEqual &&
            consentIsValid;

        if (!companyNameIsValid) setShowCompanyNameMsg(true);

        if (!fullNameIsValid) setShowFullNameMsg(true);

        if (!emailIsValid) setShowEmailMsg(true);

        if (!passwordIsValid) passwordInputRef.current?.invalidate(tErrors("validation.password"));

        if (!passwordsAreEqual) confirmPasswordInputRef.current?.invalidate(tErrors("validation.passwordsMatch"));

        if (!consentIsValid) setShowConsentMsg(true);

        return allValid;
    };

    const validateSoft = (consent = consentAccepted) => {
        const companyNameIsValid = !withCompanyName || !!companyNameInputRef.current?.checkValidity();
        const fullNameIsValid = fullNameInputRef.current?.checkValidity();
        const emailIsValid = emailInputRef.current?.checkValidity();
        const passwordIsValid = passwordInputRef.current?.checkValidity();
        const password = passwordInputRef.current?.getValue();
        const confirmPassword = confirmPasswordInputRef.current?.getValue();
        const passwordsAreEqual = password === confirmPassword;
        const consentIsValid = !withConsent || consent;
        const allValid =
            companyNameIsValid &&
            !!fullNameIsValid &&
            !!emailIsValid &&
            !!passwordIsValid &&
            passwordsAreEqual &&
            consentIsValid;

        return allValid;
    };

    const changeBtnClass = (consent = consentAccepted) => {
        const isValid = validateSoft(consent);
        const newBtnClass = isValid ? DEFAULT_BTN_CLASS : INACTIVE_BTN_CLASS;

        setBtnClass(newBtnClass);
    };

    return (
        <form className={`sign-up-form ${className}`}>
            <div className="sign-up-form__main">
                {withCompanyName && (
                    <div className="sign-up-form__input-block">
                        {showCompanyNameLabel && (
                            <label className="sign-up-form__label">{t("fields.companyName")}</label>
                        )}
                        <div className="sign-up-form__input-container">
                            <input
                                ref={companyNameInputRef}
                                className="sign-up-form__input"
                                required
                                type="text"
                                pattern={NAME_PATTERN}
                                placeholder={t("fields.companyName")}
                                onChange={handleCompanyNameChange}
                                onFocus={handleCompanyNameFocus}
                                onBlur={handleCompanyNameBlur}
                            />
                        </div>
                        {showCompanyNameMsg && (
                            <p className="sign-up-form__invalid-input-msg">{tErrors("auth.companyName")}</p>
                        )}
                    </div>
                )}
                <div className="sign-up-form__input-block">
                    {showFullNameLabel && (
                        <label className="sign-up-form__label">{t("fields.fullName")}</label>
                    )}
                    <div className="sign-up-form__input-container">
                        <input
                            ref={fullNameInputRef}
                            className="sign-up-form__input"
                            required
                            type="text"
                            pattern={NAME_PATTERN}
                            placeholder={t("fields.fullName")}
                            onChange={handleFullNameChange}
                            onFocus={handleFullNameFocus}
                            onBlur={handleFullNameBlur}
                        />
                    </div>
                    {showFullNameMsg && (
                        <p className="sign-up-form__invalid-input-msg">{tErrors("auth.fullName")}</p>
                    )}
                </div>
                <div className="sign-up-form__input-block">
                    {showEmailLabel && <label className="sign-up-form__label">{t("fields.email")}</label>}
                    <div className="sign-up-form__input-container">
                        <input
                            ref={emailInputRef}
                            className="sign-up-form__input"
                            required
                            type="email"
                            placeholder={t("fields.email")}
                            onChange={handleEmailChange}
                            onFocus={handleEmailFocus}
                            onBlur={handleEmailBlur}
                        />
                    </div>
                    {showEmailMsg && (
                        <p className="sign-up-form__invalid-input-msg">{tErrors("validation.email")}</p>
                    )}
                </div>
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
                {withConsent && (
                    <div className="sign-up-form__input-block">
                        <Checkbox
                            id="sign-up-consent"
                            className="sign-up-form__consent"
                            required
                            checked={consentAccepted}
                            error={showConsentMsg ? tErrors("auth.consent") : undefined}
                            label={
                                <Trans
                                    t={t}
                                    i18nKey="signUp.consent"
                                    components={{
                                        terms: (
                                            <a
                                                className="sign-up-form__consent-link"
                                                href={TERMS_URL}
                                                target="_blank"
                                                rel="noreferrer"
                                            />
                                        ),
                                        privacy: (
                                            <a
                                                className="sign-up-form__consent-link"
                                                href={PRIVACY_URL}
                                                target="_blank"
                                                rel="noreferrer"
                                            />
                                        ),
                                    }}
                                />
                            }
                            onChange={handleConsentChange}
                        />
                        {showConsentMsg && (
                            <p className="sign-up-form__invalid-input-msg">{tErrors("auth.consent")}</p>
                        )}
                    </div>
                )}
            </div>
            <button
                className={`
                ${btnClass}
                ${isLoading ? "sign-up-form__btn_loader" : ""}
            `}
                type="button"
                onClick={handleClick}
            >
                {t("signUp.submit")}
            </button>
        </form>
    );
}

export default forwardRef<Handle, Props>(AuthForm);
