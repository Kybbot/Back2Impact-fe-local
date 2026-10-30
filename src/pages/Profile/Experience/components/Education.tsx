import { useState, type FC } from "react";
import { useT } from "@/i18n/use-t";

import { EducationNewDialog } from "./EducationNewDialog";
import { EducationEditDialog } from "./EducationEditDialog";
import { EducationDeleteDialog } from "./EducationDeleteDialog";

import { useDegreeOptions } from "../utils/experience-options";

import type { GetUserEducationType, UserEducationType } from "../../../../services/user-service/types";

type Props = {
    data: GetUserEducationType;
};

export const Education: FC<Props> = ({ data }) => {
    const { t } = useT("profile");
    const degrees = useDegreeOptions();
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState<UserEducationType | null>(null);

    const handleOnEdit = (value: UserEducationType) => {
        setCurrentItem(value);
        setEditDialog(true);
    };

    const handleOnDeleteBtn = (value: UserEducationType) => {
        setCurrentItem(value);
        setDeleteDialog(true);
    };

    const handleClearCurrentItem = () => {
        setCurrentItem(null);
    };

    return (
        <div className="experience__block">
            <div className="experience__wrapper">
                <div className="experience__text">
                    <p className="experience__subTitle">{t("experience.education.title")}</p>
                </div>
                <EducationNewDialog />
            </div>
            {editDialog && currentItem && (
                <EducationEditDialog
                    currentItem={currentItem}
                    dialogState={editDialog}
                    setDialogState={setEditDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            {deleteDialog && currentItem && (
                <EducationDeleteDialog
                    currentItem={currentItem}
                    dialogState={deleteDialog}
                    setDialogState={setDeleteDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            {data.length ? (
                <div className="experience__cards">
                    {data.map((item) => (
                        <article className="experienceCard" key={item.id}>
                            <div className="experienceCard__left">
                                <div className="experienceCard__color experienceCard__color--pink"></div>
                                <div>
                                    <h3 className="experienceCard__title">
                                        {item.fieldOfStudy}{" "}
                                        {item.degree
                                            ? `• ${degrees.find((degree) => degree.id === item.degree)?.name}`
                                            : ""}
                                    </h3>
                                    <p className="experienceCard__text">{item.institution}</p>
                                    <p className="experienceCard__text">
                                        {item.startYear} - {item.endYear || t("experience.today")}
                                    </p>
                                    {item.description && (
                                        <p className="experienceCard__text">{item.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="experienceCard__right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleOnEdit(item);
                                    }}
                                    className="experienceCard__edit"
                                >
                                    {t("common.edit")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleOnDeleteBtn(item);
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
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
