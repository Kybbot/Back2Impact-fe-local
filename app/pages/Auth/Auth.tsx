import * as Sentry from "@sentry/react";
import { Trans } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Link, useNavigate } from "../../i18n/navigation";
import LoginForm from "./components/login-form/login-form";
import SignUpForm from "./components/sign-up-form/sign-up-form";
import { useT } from "../../i18n/use-t";
import { useLocale } from "../../i18n/use-locale";
import { LOCALE_TO_STORED } from "../../i18n/stored-language";
import type { LoginFormRef, LoginPayload, ResponseError, SignUpPayload } from "./types";
import googleIcon from "/img/google-icon.svg";
import photo from "/img/auth-photo.png";
import warningIcon from "/img/warning-icon.svg";
import leftArrowIcon from "/img/left-arrow-icon.svg";
import CheckEmailBlock from "./components/check-email-block/check-email-block";
import ResetPasswordForm from "./components/reset-password-form/reset-password-form";
import authService from "../../services/auth-service/auth-service";
import { toast } from "react-toastify";
import { ApiError } from "../../errors/api-error";
import { useEmployerSignUp, useLogin, useSignUp } from "../../hooks/use-auth-mutations";
import { getQueryClient } from "../../api/query-client";
import { meQuery } from "../../hooks/useCurrentUser";
import { getHomePath } from "../../utils/home-path";
import type { UserRole } from "../../services/user-service/types";

const API_URL = import.meta.env.VITE_API_URL;

type Props = {
    /** which kind of account this page signs up; login works for both */
    role?: UserRole;
};

function Auth({ role = "candidate" }: Props) {
    const { t } = useT("auth");
    const { t: tErrors } = useT("errors");
    const login = useLogin();
    const candidateSignUp = useSignUp();
    const employerSignUp = useEmployerSignUp();
    const navigate = useNavigate();
    const language = LOCALE_TO_STORED[useLocale()];
    const [searchParams, setSearchParams] = useSearchParams();
    const loginFormRef = useRef<LoginFormRef>(null);
    const [email, setEmail] = useState<string | null>(null);

    const [errorCode, setErrorCode] = useState<ResponseError | null>();
    const [checkEmailIsShowed, setCheckEmailIsShowed] = useState(false);

    useEffect(() => {
        const error = searchParams.get("error");

        if (error === "link_expired") setErrorCode("LINK_EXPIRED");
        else if (error === "invalid_link") setErrorCode("INVALID_LINK");
        else if (error === "google_error") setErrorCode("GOOGLE_FAILURE");
        else if (error === "invalid_reset_link") setErrorCode("INVALID_RESET_LINK");
    }, []);

    /**
     * Two of these embed a clickable span mid-sentence. `Trans` keeps the
     * sentence a single translatable unit and lets each language put the link
     * where its grammar wants it, instead of gluing three fragments together.
     */
    const errors = {
        EMAIL_NOT_VERIFIED: (
            <Trans
                t={tErrors}
                i18nKey="auth.emailNotVerified"
                components={{
                    resend: (
                        <span
                            className="auth-layout__underline"
                            onClick={() => setCheckEmailIsShowed(true)}
                        />
                    ),
                }}
            />
        ),
        USER_ALREADY_EXISTS: (
            <Trans
                t={tErrors}
                i18nKey="auth.userAlreadyExists"
                components={{
                    login: (
                        <span
                            className="auth-layout__underline"
                            onClick={() => setSearchParams({ tab: "login" })}
                        />
                    ),
                }}
            />
        ),
        GOOGLE_FAILURE: tErrors("auth.googleFailure"),
        GENERIC_ERROR: tErrors("generic.tryAgainSoon"),
        LINK_EXPIRED: tErrors("auth.linkExpired"),
        INVALID_LINK: tErrors("auth.invalidLink"),
        INVALID_RESET_LINK: tErrors("auth.invalidResetLink"),
    };

    const tab = searchParams.get("tab") as string;

    const handleLoginClick = async (pl: LoginPayload) => {
        try {
            if (errorCode) setErrorCode(null);

            // resolves only once the `me` query holds the user, so the
            // guard of the page navigated to finds it in the cache
            const result = await login.mutateAsync(pl);
            const user = getQueryClient().getQueryData(meQuery().queryKey);

            // an employer goes to their own cabinet whichever page they logged in on
            if (user?.role === "employer") navigate(getHomePath(user), { replace: true });
            else if (result.redirectPath) navigate(result.redirectPath);
            else navigate("/jobs/all", { replace: true });
        } catch (e) {
            if (e instanceof ApiError && e.message === "EMAIL_NOT_VERIFIED")
                setErrorCode("EMAIL_NOT_VERIFIED");
            else if (e instanceof ApiError && e.message === "INVALID_EMAIL_OR_PASSWORD") {
                loginFormRef.current?.invalidate();
            } else {
                setErrorCode("GENERIC_ERROR");
                Sentry.captureException(e);
            }
        }
    };

    const handleSignUpClick = async (pl: SignUpPayload) => {
        if (errorCode) setErrorCode(null);

        setEmail(pl.email);

        try {
            if (role === "employer")
                await employerSignUp.mutateAsync({ ...pl, companyName: pl.companyName ?? "", language });
            else await candidateSignUp.mutateAsync({ ...pl, language });

            setCheckEmailIsShowed(true);
        } catch (e) {
            if (e instanceof ApiError && e.message === "EMAIL_NOT_VERIFIED")
                setErrorCode("EMAIL_NOT_VERIFIED");
            else if (e instanceof ApiError && e.message === "USER_ALREADY_EXISTS")
                setErrorCode("USER_ALREADY_EXISTS");
            else setErrorCode("GENERIC_ERROR");
        }
    };

    const handleResetPasswordClick = async (email: string) => {
        try {
            await authService.forgotPassword(email);

            toast.success(t("checkEmail.heading"));
            setSearchParams({ tab: "login" });
        } catch {
            toast.error(tErrors("generic.tryAgainSoon"));
        }
    };

    const onTabClick = (tab: "login" | "sign-up") => {
        if (errorCode) setErrorCode(null);

        setSearchParams({ tab });
    };

    const onBackToLoginClick = () => {
        setCheckEmailIsShowed(false);

        setSearchParams({ tab: "login" });
    };

    const resend = async () => {
        await authService.resendVerification();
    };

    const linesColor = ["login", "reset-password"].includes(tab) ? "#86B4FF" : "#FFC51B";
    const suitcaseColor = ["login", "reset-password"].includes(tab) ? "#FFC51B80" : "#72A8FF80";

    const showGoogleBtn = tab === "login" || tab === "sign-up";
    const showTabs = tab === "login" || tab === "sign-up";

    // the other kind of account signs up on its own page
    const otherRoleAuthPath = role === "employer" ? "/auth" : "/employers/auth";

    return (
        <div className="auth-layout">
            <svg
                className="auth-layout__left-line"
                viewBox="0 0 1015 419"
                fill="none"
                width={1015}
                height={419}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3.00012 415.274C9.18011 322.763 43.1937 232.282 99.474 158.604C136.129 110.625 230.787 8.55661 286.383 92.8077C312.33 132.125 312.448 275.068 321.529 308.273C338.488 370.222 410.101 365.644 458.951 335.791C525.044 295.411 541.06 225.556 559.6 155.724C568.02 124.006 572.62 89.7869 562.006 58.706C551.391 27.6488 521.93 1.12268 489.19 3.10506C447.322 5.60663 419.583 55.756 430.952 96.1352C442.322 136.514 482.468 163.796 523.746 171.159C558.326 177.318 595.193 172.197 627.674 185.602C689.709 211.207 650.579 282.874 713.393 341.642C833.678 403.592 967.508 290.373 1011.29 301.535"
                    stroke={linesColor}
                    strokeWidth="6"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                />
            </svg>
            <svg
                className="auth-layout__right-line"
                viewBox="0 0 721 516"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M199.886 512.146C291.959 375.14 193.403 346.429 66.0282 358.574C-10.5521 365.878 -17.9197 272.632 47.0621 238.849C126.189 190.732 213.063 242.701 293.37 256.783C349.51 258.277 374.939 201.172 333.323 162.926C299.853 134.047 268.952 91.0869 292.044 46.211C323.871 -19.461 411.145 -3.46401 449.582 48.7158C485.873 82.6885 507.26 189.048 561.633 175.513C588.051 168.925 585.44 141.499 593.65 121.06C612.511 70.2066 686.565 60.5452 717.846 104.874"
                    stroke={linesColor}
                    strokeWidth="6"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                />
            </svg>
            <svg
                className="auth-layout__suitcase"
                width="82"
                height="82"
                viewBox="0 0 82 82"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="82" height="82" rx="24" fill="white" />
                <rect width="82" height="82" rx="24" fill={suitcaseColor} />
                <g clipPath="url(#clip0_17_15)">
                    <path
                        d="M35.6659 34.3335L35.6659 31.6668C35.6659 30.9596 35.9468 30.2813 36.4469 29.7812C36.947 29.2811 37.6253 29.0002 38.3325 29.0002L43.6659 29.0002C44.3731 29.0002 45.0514 29.2811 45.5515 29.7812C46.0516 30.2813 46.3325 30.9596 46.3325 31.6668L46.3325 34.3335M28.9992 37.0002C28.9992 36.2929 29.2802 35.6146 29.7803 35.1145C30.2803 34.6144 30.9586 34.3335 31.6659 34.3335L50.3325 34.3335C51.0398 34.3335 51.7181 34.6144 52.2182 35.1145C52.7183 35.6146 52.9992 36.2929 52.9992 37.0002L52.9992 49.0002C52.9992 49.7074 52.7183 50.3857 52.2182 50.8858C51.7181 51.3859 51.0398 51.6668 50.3325 51.6668L31.6659 51.6668C30.9586 51.6668 30.2803 51.3859 29.7803 50.8858C29.2802 50.3857 28.9992 49.7074 28.9992 49.0002L28.9992 37.0002Z"
                        stroke="#333333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_17_15">
                        <rect width="32" height="32" fill="white" transform="translate(24.9991 25.0002)" />
                    </clipPath>
                </defs>
            </svg>
            <img src={photo} className="auth-layout__picture" alt="" aria-hidden="true" />

            <div className="auth-layout__central-block">
                {errorCode && (
                    <div className="auth-layout__error-block">
                        <img
                            src={warningIcon}
                            className="auth-layout__warning-icon"
                            alt=""
                            aria-hidden="true"
                        />
                        <p className="auth-layout__error-str">{errors[errorCode as ResponseError]}</p>
                    </div>
                )}
                {showTabs && (
                    <div className="auth-layout__tabs">
                        <button
                            className={`auth-layout__tab ${tab === "sign-up" ? "auth-layout__tab_active" : ""}`}
                            type="button"
                            onClick={() => onTabClick("sign-up")}
                        >
                            {t("tabs.signUp")}
                        </button>
                        <button
                            className={`auth-layout__tab ${tab === "login" ? "auth-layout__tab_active" : ""}`}
                            type="button"
                            onClick={() => onTabClick("login")}
                        >
                            {t("tabs.login")}
                        </button>
                    </div>
                )}
                <div className="auth-layout__form-container">
                    {tab === "login" && <LoginForm ref={loginFormRef} onClick={handleLoginClick} />}
                    {tab === "sign-up" && (
                        <SignUpForm
                            withCompanyName={role === "employer"}
                            withConsent={role === "employer"}
                            onClick={handleSignUpClick}
                        />
                    )}
                    {tab === "reset-password" && <ResetPasswordForm onClick={handleResetPasswordClick} />}

                    {showGoogleBtn && (
                        <div className="auth-layout__google-block">
                            <div className="auth-layout__or-block">
                                <hr className="auth-layout__or-line" />
                                <p className="auth-layout__or-str">{t("or")}</p>
                            </div>
                            <a
                                className="auth-layout__google-btn"
                                href={`${API_URL}/auth/google?role=${role}&language=${language}`}
                            >
                                <img
                                    className="auth-layout__google-icon"
                                    src={googleIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <span className="auth-layout__google-btn-str">{t("continueWithGoogle")}</span>
                            </a>
                        </div>
                    )}
                </div>
                <div className="auth-layout__bottom-block">
                    {tab === "login" && (
                        <>
                            <p
                                className="auth-layout__forgot-password-str"
                                onClick={() => setSearchParams({ tab: "reset-password" })}
                            >
                                {t("forgotPassword")}
                            </p>
                            <p className="auth-layout__bottom-str">
                                <Trans
                                    t={t}
                                    i18nKey="noAccount"
                                    components={{
                                        signUp: (
                                            <span
                                                className="auth-layout__change-tab-str"
                                                onClick={() => setSearchParams({ tab: "sign-up" })}
                                            />
                                        ),
                                    }}
                                />
                            </p>
                            <p className="auth-layout__bottom-str">
                                <Trans
                                    t={t}
                                    i18nKey={
                                        role === "employer"
                                            ? "switchRole.toCandidate.login"
                                            : "switchRole.toEmployer.login"
                                    }
                                    components={{
                                        roleLink: (
                                            <Link
                                                className="auth-layout__change-tab-str"
                                                to={`${otherRoleAuthPath}?tab=login`}
                                            />
                                        ),
                                    }}
                                />
                            </p>
                        </>
                    )}
                    {tab === "sign-up" && (
                        <>
                            <p className="auth-layout__bottom-str">
                                <Trans
                                    t={t}
                                    i18nKey="hasAccount"
                                    components={{
                                        logIn: (
                                            <span
                                                className="auth-layout__change-tab-str"
                                                onClick={() => setSearchParams({ tab: "login" })}
                                            />
                                        ),
                                    }}
                                />
                            </p>
                            <p className="auth-layout__bottom-str">
                                <Trans
                                    t={t}
                                    i18nKey={
                                        role === "employer"
                                            ? "switchRole.toCandidate.signUp"
                                            : "switchRole.toEmployer.signUp"
                                    }
                                    components={{
                                        roleLink: (
                                            <Link
                                                className="auth-layout__change-tab-str"
                                                to={`${otherRoleAuthPath}?tab=sign-up`}
                                            />
                                        ),
                                    }}
                                />
                            </p>
                        </>
                    )}
                    {tab === "reset-password" && (
                        <button
                            className="auth-layout__back-to-login-btn"
                            type="button"
                            onClick={() => setSearchParams({ tab: "login" })}
                        >
                            <img
                                className="auth-layout__left-arrow-icon"
                                src={leftArrowIcon}
                                alt=""
                                aria-hidden="true"
                            />
                            <span>{t("backToLogin")}</span>
                        </button>
                    )}
                </div>
            </div>
            {checkEmailIsShowed && (
                <CheckEmailBlock
                    email={email ?? ""}
                    onClose={() => setCheckEmailIsShowed(false)}
                    onBackToLoginClick={onBackToLoginClick}
                    onResendClick={resend}
                />
            )}
        </div>
    );
}

export default Auth;
