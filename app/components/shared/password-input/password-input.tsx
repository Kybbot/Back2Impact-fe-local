import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent, type Ref } from "react";
import { useT } from "@/i18n/use-t";
import eyeIcon from '/img/eye-show-icon.svg';
import eyeOffIcon from '/img/eye-off-icon.svg';
import okIcon from '/img/success-icon.svg';

type Handle = {
    getValue: () => string;
    invalidate: (msg: string) => void;
    makeValid: () => void;
    checkValidity: () => boolean;
}
type Props = {
    inputType: 'password' | 'confirm_password';
    originalPassword?: string;
    isOk?: boolean;
    onChange: (value: string) => void;
    onBlur: () => void;
}
type PasswordLevel = 'weak' | 'medium' | 'strong'
const PasswordStrength: Record<string, PasswordLevel> = {
    Weak: "weak",
    Medium: "medium",
    Strong: "strong",
}

const strengthConfig = {
  weak: {
    activeBars: 1,
    color: "red",
    label: "Weak",
  },
  medium: {
    activeBars: 2,
    color: "yellow",
    label: "Medium",
  },
  strong: {
    activeBars: 3,
    color: "green",
    label: "Strong",
  },
} as const;


function PasswordInput({
    inputType,
    originalPassword,
    isOk,
    onChange,
    onBlur
}: Props, ref: Ref<Handle>) {
    const { t } = useT("auth");
    const [showPassword, setShowPassword] = useState(false);
    const [showEyeImg, setShowEyeImg] = useState(false);
    const [showLabel, setShowLabel] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [strength, setStrength] = useState<PasswordLevel>('weak');
    const inputRef = useRef<HTMLInputElement>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => inputRef.current?.value as string,
        invalidate: (msg: string) => { setErrorMsg(msg) },
        makeValid: () => { setErrorMsg(null) },
        checkValidity: () => {
            const value = inputRef.current?.value as string;
            const isValid = /(?=.*[A-Z])(?=.*\d).{8,}/.test(value);

            return isValid;
        }
    }));
    
    const getPasswordStrength = () => {
        const password = inputRef.current?.value as string;

        if (password.length < 8) return PasswordStrength.Weak;

        const hasUppercase = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);

        if (hasUppercase && hasDigit) return PasswordStrength.Strong;
        if (hasUppercase || hasDigit) return PasswordStrength.Medium;

        return PasswordStrength.Weak;
    }

    const handleFocus = () => {
        setShowEyeImg(true);
        setIsFocused(true);
        
        if(!showLabel) setShowLabel(true);
    }

    const handleBlur = () => {
        const isEmpty = inputRef.current?.value?.length === 0;

        if(isEmpty) setShowLabel(false);

        setShowEyeImg(false);
        setIsFocused(false)
        onBlur();
    }

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const strength = getPasswordStrength();
        let isValid: boolean;
        
        if(inputType === 'password')
            isValid = inputRef.current?.checkValidity() as boolean;
        else
            isValid = originalPassword === value;

        if(isValid && errorMsg) setErrorMsg(null);

        setStrength(strength);
        onChange(value);
    };

    const config = strengthConfig[strength];
    const label = inputType === 'password' ? t("fields.password") : t("fields.confirmPassword");
    
    return <div className="password-input__input-block">
        <div className="password-input__top-block">
            {showLabel && <label className="password-input__label">{label}</label>}
            {(inputType === 'password' && isFocused) && (
                <div className="password-input__bars">
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={index}
                            className={`password-input__bar password-input__bar_${index < config.activeBars ? config.color : 'gray'}`} />
                    ))}
                </div>
            )}
        </div>
        <div className="password-input__input-container">
            <input
                ref={inputRef}
                className="password-input__input"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder={label}
                onChange={handlePasswordChange}
                onFocus={handleFocus}
                onBlur={handleBlur} />
                {showEyeImg && <button
                    className="password-input__input-icon-btn"
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(p => !p)}>
                    <img
                        className="password-input__input-icon"
                        src={showPassword ? eyeIcon : eyeOffIcon} alt="" aria-hidden="true" />
                </button>}
                {(isOk && !showEyeImg) && (
                    <img
                        className="password-input__success-icon"
                        src={okIcon} alt="" aria-hidden="true" />
                )}
        </div>
        {errorMsg && (
            <p className="password-input__invalid-input-msg">
                {errorMsg}
            </p>
        )}
    </div>
}

export default forwardRef<Handle, Props>(PasswordInput);