import { useState, type FC } from "react";
import { useT } from "@/i18n/use-t";
import { useLanguageLabel } from "@/i18n/language-options";

import { LanguagesNewDialog } from "./LanguagesNewDialog";
import { LanguagesEditDialog } from "./LanguagesEditDialog";
import { LanguagesDeleteDialog } from "./LanguagesDeleteDialog";

import { useLanguageLevelOptions } from "../utils/experience-options";

import type { GetUserLanguagesType, UserLanguageType } from "../../../../services/user-service/types";

type Props = {
    data: GetUserLanguagesType;
};

// Languages have no id, so an entry is identified by its position in the list.
type CurrentItem = {
    index: number;
    value: UserLanguageType;
};

export const Languages: FC<Props> = ({ data }) => {
    const { t } = useT("profile");
    const languageLabel = useLanguageLabel();
    const languageLevels = useLanguageLevelOptions();
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState<CurrentItem | null>(null);

    const handleOnEdit = (index: number, value: UserLanguageType) => {
        setCurrentItem({ index, value });
        setEditDialog(true);
    };

    const handleOnDeleteBtn = (index: number, value: UserLanguageType) => {
        setCurrentItem({ index, value });
        setDeleteDialog(true);
    };

    const handleClearCurrentItem = () => {
        setCurrentItem(null);
    };

    return (
        <div className="experience__block">
            <div className="experience__wrapper">
                <div className="experience__text">
                    <p className="experience__subTitle">{t("experience.languages.title")}</p>
                    <p className="experience__description">{t("experience.languages.description")}</p>
                </div>
                <LanguagesNewDialog languages={data} />
            </div>
            {editDialog && currentItem && (
                <LanguagesEditDialog
                    languages={data}
                    index={currentItem.index}
                    currentItem={currentItem.value}
                    dialogState={editDialog}
                    setDialogState={setEditDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            {deleteDialog && currentItem && (
                <LanguagesDeleteDialog
                    languages={data}
                    index={currentItem.index}
                    dialogState={deleteDialog}
                    setDialogState={setDeleteDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            {data.length ? (
                <div className="experience__cards">
                    {data.map((item, index) => (
                        <article className="languageCard" key={index}>
                            <div className="languageCard__field">{languageLabel(item.language)}</div>
                            <div className="languageCard__field">
                                {languageLevels.find((level) => level.id === item.level)?.name}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    handleOnEdit(index, item);
                                }}
                                className="experienceCard__edit"
                            >
                                {t("common.edit")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleOnDeleteBtn(index, item);
                                }}
                                className="experienceCard__delete"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke="#838383"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.9993 8.66797L8.66602 16.0013M15.9993 16.0013L8.66602 8.66797"
                                    />
                                </svg>
                            </button>
                        </article>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
