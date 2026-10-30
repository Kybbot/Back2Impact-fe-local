import instance from "../../api/instance";
import type { StoredLanguage } from "../../i18n/stored-language";

export type LoginDTO = { email: string; password: string };
export type SignUpDTO = { fullName: string; email: string; password: string; language: StoredLanguage };
export type EmployerSignUpDTO = SignUpDTO & { companyName: string };
export type ResetPasswordDTO = { token: string; password: string };

export type LoginResult = { message: string; redirectPath?: string };

/**
 * Everything under `/auth/*`. The endpoints that establish or end a session
 * skip the token refresh: a 401 from them is the API's answer, and replaying
 * a login after a refresh would be nonsense.
 */
class AuthService {
    login(pl: LoginDTO) {
        return instance.post<LoginResult>("/auth/login", pl, { skipAuthRefresh: true });
    }

    signUp(pl: SignUpDTO) {
        return instance.post<{ message: string }>("/auth/sign-up", pl, { skipAuthRefresh: true });
    }

    employerSignUp(pl: EmployerSignUpDTO) {
        return instance.post<{ message: string }>("/auth/employers/sign-up", pl, { skipAuthRefresh: true });
    }

    logout() {
        return instance.post("/auth/logout", undefined, { skipAuthRefresh: true });
    }

    verifyEmail(token: string) {
        return instance.post<{ message: string }>("/auth/verify-email", { token }, { skipAuthRefresh: true });
    }

    resendVerification() {
        return instance.post("/auth/resend-verification");
    }

    forgotPassword(email: string) {
        return instance.post("/auth/forgot-password", { email }, { skipAuthRefresh: true });
    }

    checkReset(token: string) {
        return instance.get("/auth/check-reset", { params: { token }, skipAuthRefresh: true });
    }

    changePassword(pl: ResetPasswordDTO) {
        return instance.post("/auth/change-password", pl, { skipAuthRefresh: true });
    }

    rememberRedirect(path: string) {
        return instance.post("/auth/remember-redirect", { path });
    }
}

export default new AuthService();
