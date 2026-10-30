import { useSearchParams } from "react-router";
import { useT } from "@/i18n/use-t";
import { Link, useNavigate } from "../../i18n/navigation";
import SetNewPasswordForm from "./components/set-new-password-form/set-new-password-form";
import leftArrowIcon from "/img/left-arrow-icon.svg";
import photo from "/img/auth-photo.png";
import { useEffect, useState } from "react";
import PasswordUpdatedBlock from "./components/password-updated-block/password-updated-block";
import authService from "../../services/auth-service/auth-service";
import type { UserRole } from "../../services/user-service/types";
import { getLoginPath } from "../../utils/home-path";
import { toast } from "react-toastify";

function ResetPasswordBlock() {
    const { t } = useT("auth");
    const { t: tErrors } = useT("errors");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isComplete, setIsComplete] = useState(false);

    const role = searchParams.get("role") as UserRole | null; // candidate | employer
    const loginPath = getLoginPath(role);

    const linesColor = "#86B4FF";
    const suitcaseColor = "#FFC51B80";

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = async () => {
        const token = searchParams.get("token");

        if (!token) return navigate(`${loginPath}&error=invalid_reset_link`, { replace: true });

        try {
            await authService.checkReset(token);
        } catch {
            navigate(`${loginPath}&error=invalid_reset_link`, { replace: true });
        }
    };

    const handlePasswordUpdate = async (password: string) => {
        const token = searchParams.get("token") as string;

        try {
            await authService.changePassword({ token, password });

            setIsComplete(true);
        } catch {
            toast.error(tErrors("generic.tryAgainSoon"));
        }
    };

    return (
        <div className="reset-password-block">
            <svg
                className="auth-layout__left-line"
                viewBox="0 0 1015 419"
                fill="none"
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
            <div className="reset-password-block__central-block">
                {isComplete ? (
                    <>
                        <PasswordUpdatedBlock
                            onClick={() => navigate(loginPath, { replace: true })}
                        />
                    </>
                ) : (
                    <>
                        <SetNewPasswordForm
                            className="reset-password-block__set-new-password-form"
                            onClick={handlePasswordUpdate}
                        />
                        <Link className="reset-password-block__back-to-login-link" to={loginPath}>
                            <img
                                className="left-arrow-icon"
                                src={leftArrowIcon}
                                alt={""}
                                aria-hidden="true"
                            />
                            <span>{t("backToLogin")}</span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordBlock;
