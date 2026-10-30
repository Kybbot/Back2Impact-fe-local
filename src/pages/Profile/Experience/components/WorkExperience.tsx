import { useState, type FC } from "react";
import { useT } from "@/i18n/use-t";

import { WorkExperienceNewDialog } from "./WorkExperienceNewDialog";
import { WorkExperienceEditDialog } from "./WorkExperienceEditDialog";
import { WorkExperienceDeleteDialog } from "./WorkExperienceDeleteDialog";

import type {
    UserWorkExperienceType,
    GetUserWorkExperienceType,
} from "../../../../services/user-service/types";

type Props = {
    data: GetUserWorkExperienceType;
};

export const WorkExperience: FC<Props> = ({ data }) => {
    const { t } = useT("profile");
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState<UserWorkExperienceType | null>(null);

    const handleOnEdit = (value: UserWorkExperienceType) => {
        setCurrentItem(value);
        setEditDialog(true);
    };

    const handleOnDeleteBtn = (value: UserWorkExperienceType) => {
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
                    <h2 className="experience__subTitle">{t("experience.work.title")}</h2>
                </div>
                <WorkExperienceNewDialog />
            </div>
            {editDialog && currentItem && (
                <WorkExperienceEditDialog
                    currentItem={currentItem}
                    dialogState={editDialog}
                    setDialogState={setEditDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            {deleteDialog && currentItem && (
                <WorkExperienceDeleteDialog
                    currentItem={currentItem}
                    dialogState={deleteDialog}
                    setDialogState={setDeleteDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            <div className="experience__cards">
                {data.length ? (
                    <>
                        {data.map((item) => (
                            <article className="experienceCard" key={item.id}>
                                <div className="experienceCard__left">
                                    <div className="experienceCard__color experienceCard__color--blue"></div>
                                    <div>
                                        <h3 className="experienceCard__title">{item.title}</h3>
                                        <p className="experienceCard__text">{item.company}</p>
                                        <p className="experienceCard__text">
                                            {item.startYear} - {item.endYear || t("experience.today")}
                                        </p>
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
                    </>
                ) : null}
            </div>
        </div>
    );
};
