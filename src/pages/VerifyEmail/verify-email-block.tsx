import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useNavigate } from "../../i18n/navigation";
import { ApiError } from "../../errors/api-error";
import { useVerifyEmail } from "../../hooks/use-auth-mutations";
import { getQueryClient } from "../../api/query-client";
import { meQuery } from "../../hooks/useCurrentUser";
import type { UserRole } from "../../services/user-service/types";
import { getAuthPath, getHomePath } from "../../utils/home-path";

function VerifyEmailBlock() {
    const verifyEmail = useVerifyEmail();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // runs once: the token is in the URL and does not change while the page is open
    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role") as UserRole | null; // candidate | employer
        const authPath = getAuthPath(role);

        if (!token) {
            alert("No token provided");
            return;
        }

        // resolves with the `me` query already loaded, so the onboarding
        // guard lets the freshly verified user straight in
        verifyEmail
            .mutateAsync(token)
            .then(() => {
                const user = getQueryClient().getQueryData(meQuery().queryKey);

                navigate(user ? getHomePath(user) : "/onboarding/about-you", { replace: true });
            })
            .catch((e: unknown) => {
                if (e instanceof ApiError && e.message === "EXPIRED_TOKEN")
                    navigate(`${authPath}?tab=login&error=link_expired`, { replace: true });
                else if (e instanceof ApiError && e.message === "INVALID_TOKEN")
                    navigate(`${authPath}?tab=login&error=invalid_link`, { replace: true });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="verify-email-block"></div>;
}

export default VerifyEmailBlock;
