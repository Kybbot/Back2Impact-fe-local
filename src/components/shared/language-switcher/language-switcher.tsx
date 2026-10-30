import { Link, useLocation } from "react-router";

import { useT } from "@/i18n/use-t";
import { useLocale } from "@/i18n/use-locale";
import { switchLocalePath } from "@/i18n/locale";
import { SUPPORTED_LOCALES } from "@/i18n/config";

import { useChangeLanguage } from "@/hooks/use-change-language";

type Props = {
    className?: string;
};

export function LanguageSwitcher({ className }: Props) {
    const locale = useLocale();
    const location = useLocation();
    const { t } = useT("common");
    const { saveLanguage } = useChangeLanguage();

    return (
        <div role="group" aria-label={t("language.label")} className={`language-switcher ${className ?? ""}`}>
            {SUPPORTED_LOCALES.map((option) => {
                const isActive = option === locale;

                return (
                    // the path is already localized, so the plain router link is used on purpose
                    <Link
                        key={option}
                        lang={option}
                        hrefLang={option}
                        to={switchLocalePath(location, option)}
                        aria-current={isActive ? "page" : undefined}
                        className={`language-switcher__link ${isActive ? "language-switcher__link--active" : ""}`}
                        onClick={(event) => {
                            if (isActive) {
                                event.preventDefault();
                                return;
                            }

                            saveLanguage(option);
                        }}
                    >
                        {t(`language.short.${option}`)}
                    </Link>
                );
            })}
        </div>
    );
}

export default LanguageSwitcher;
