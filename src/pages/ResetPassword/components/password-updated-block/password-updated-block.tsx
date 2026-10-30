import { Trans } from "react-i18next";

import successIcon from "/img/success-icon.svg";
import { useT } from "@/i18n/use-t";
import leftArrowIcon from "/img/left-arrow-icon-2.svg";

type Props = {
    className?: string;
    onClick: () => void;
};

function PasswordUpdatedBlock({ className, onClick }: Props) {
    const { t } = useT("auth");
    return (
        <div className={`password-updated-block ${className}`}>
            <div className="password-updated-block__main">
                <img
                    className="password-updated-block__success-icon"
                    src={successIcon}
                    alt={""}
                    aria-hidden="true"
                />
                <div className="password-updated-block__header">
                    <h2 className="password-updated-block__heading">{t("passwordUpdated.heading")}</h2>
                    <p className="password-updated-block__description">
                        <Trans t={t} i18nKey="passwordUpdated.description" components={{ br: <br /> }} />
                    </p>
                </div>
            </div>
            <button className="password-updated-block__btn" type="button" onClick={onClick}>
                <img
                    className="password-update-block__left-arrow-icon"
                    src={leftArrowIcon}
                    alt={""}
                    aria-hidden="true"
                />
                <span>{t("backToLogin")}</span>
            </button>
        </div>
    );
}

export default PasswordUpdatedBlock;
