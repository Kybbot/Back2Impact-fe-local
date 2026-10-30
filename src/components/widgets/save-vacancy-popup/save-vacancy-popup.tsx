import { useT } from "@/i18n/use-t";
type Props = {
    onBackgroundClick: () => void;
    onClick: () => void;
};

function SaveVacancyPopup({ onBackgroundClick, onClick }: Props) {
    const { t } = useT("jobs");
    return (
        <div className="save-vacancy-popup" onClick={onBackgroundClick}>
            <div className="save-vacancy-popup__central-block">
                <h2 className="save-vacancy-popup__heading">{t("savePopup.heading")}</h2>
                <button className="save-vacancy-popup__link" onClick={onClick}>
                    {t("savePopup.action")}
                </button>
            </div>
        </div>
    );
}

export default SaveVacancyPopup;
