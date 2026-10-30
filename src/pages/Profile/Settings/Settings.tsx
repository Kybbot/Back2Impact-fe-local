import type { FC } from "react";

import { SettingsContent } from "./components/SettingsContent";
import LoaderBlock from "../../../components/shared/loader-block/loader-block";

import { useT } from "../../../i18n/use-t";
import { useGetUserSettings } from "./hooks/useGetUserSettings";

const Settings: FC = () => {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const { data, isError, isLoading, isSuccess } = useGetUserSettings();

    return (
        <div className="settings">
            <div className="settingHeader">
                <div className="settingHeader__icon">⚙️</div>
                <h1 className="settingHeader__title">{t("settings.title")}</h1>
            </div>
            {isLoading ? (
                <div className="settings__loader">
                    <LoaderBlock className="loader-block--blue" />
                </div>
            ) : isError ? (
                <p className="apply-form__file-error-message">{tErrors("generic.tryAgainSoon")}</p>
            ) : isSuccess && data ? (
                <SettingsContent settings={data} />
            ) : (
                <p>{t("noData")}</p>
            )}
        </div>
    );
};

export default Settings;
