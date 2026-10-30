import { Trans } from "react-i18next";

import { useCountdown } from "../../../../hooks/useCountdown";
import { useT } from "@/i18n/use-t";
import closeIcon from "/img/close-icon.svg";
import confirmIcon from "/img/success-icon.svg";
import mailImage from "/img/mail.svg";

type Props = {
    email: string;
    onClose: () => void;
    onBackToLoginClick: () => void;
    onResendClick: () => void;
};

function CheckEmailBlock({ email, onClose, onBackToLoginClick, onResendClick }: Props) {
    const { t } = useT("auth");
    const { secondsLeft, isFinished, restart } = useCountdown(60);

    const handleResendClick = () => {
        restart();
        onResendClick();
    };

    return (
        <div className="check-email-block">
            <div className="check-email-block__central-block">
                <button className="check-email-block__close-btn" type="button" onClick={onClose}>
                    <img className="check-email-block__close-icon" src={closeIcon} alt={t("close")} />
                </button>

                <div className="check-email-block__header">
                    <img
                        src={confirmIcon}
                        className="check-email-block__confirm-icon"
                        alt={""}
                        aria-hidden="true"
                    />
                    <span className="check-email-block__header-str">{t("checkEmail.created")}</span>
                </div>

                <img src={mailImage} className="check-email-block__mail-img" alt={""} />

                <div className="check-email-block__main-info">
                    <p className="check-email-block__check-str">{t("checkEmail.heading")}</p>
                    <p className="check-email-block__description">
                        <Trans
                            t={t}
                            i18nKey="checkEmail.sentTo"
                            values={{ email }}
                            components={{
                                email: <span className="check-email-block__bold" />,
                                br: <br />,
                            }}
                        />
                    </p>
                </div>

                <hr className="check-email-block__line" />

                <p className="check-email-block__cant-find-str">{t("checkEmail.spam")}</p>

                <div className="check-email-block__btns-container">
                    <button
                        className="check-email-block__btn check-email-block__btn_gray"
                        type="button"
                        onClick={onBackToLoginClick}
                    >
                        {t("backToLogin")}
                    </button>
                    {isFinished ? (
                        <button
                            className="check-email-block__btn check-email-block__btn_active"
                            type="button"
                            onClick={handleResendClick}
                        >
                            {t("checkEmail.resend")}
                        </button>
                    ) : (
                        <button
                            className="check-email-block__btn check-email-block__btn_disabled"
                            type="button"
                        >
                            {t("checkEmail.resendIn", { count: secondsLeft })}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CheckEmailBlock;
