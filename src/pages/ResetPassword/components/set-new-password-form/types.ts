export type PasswordInputRef = {
    getValue: () => string;
    invalidate: (msg: string) => void;
    makeValid: () => void;
    checkValidity: () => boolean;
}