export type LoginPayload = {
    email: string;
    password: string;
}

export type SignUpPayload = {
    companyName?: string;
    fullName: string;
    email: string;
    password: string;
}

export type LoginFormRef = {
    invalidate: () => void;
}

export type ResponseError = 'EMAIL_NOT_VERIFIED'
    | 'USER_ALREADY_EXISTS'
    | 'GOOGLE_FAILURE'
    | 'GENERIC_ERROR'
    | 'LINK_EXPIRED'
    | 'INVALID_LINK'
    | 'INVALID_RESET_LINK';