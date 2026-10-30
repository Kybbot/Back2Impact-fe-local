import { useState, type FC } from "react";
import { useT } from "@/i18n/use-t";

import { ProjectsNewDialog } from "./ProjectsNewDialog";
import { ProjectsEditDialog } from "./ProjectsEditDialog";
import { ProjectsDeleteDialog } from "./ProjectsDeleteDialog";

import type { GetUserProjectsType, UserProjectType } from "../../../../services/user-service/types";

type Props = {
    data: GetUserProjectsType;
};

export const Projects: FC<Props> = ({ data }) => {
    const { t } = useT("profile");
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState<UserProjectType | null>(null);

    const handleOnEdit = (value: UserProjectType) => {
        setCurrentItem(value);
        setEditDialog(true);
    };

    const handleOnDeleteBtn = (value: UserProjectType) => {
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
                    <p className="experience__subTitle">{t("experience.projects.title")}</p>
                </div>
                <ProjectsNewDialog />
            </div>
            {editDialog && currentItem && (
                <ProjectsEditDialog
                    currentItem={currentItem}
                    dialogState={editDialog}
                    setDialogState={setEditDialog}
                    handleClearCurrentItem={handleClearCurrentItem}
                />
            )}
            {deleteDialog && currentItem && (
                <ProjectsDeleteDialog
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
                                <div className="experienceCard__color experienceCard__color--green"></div>
                                <div>
                                    <h3 className="experienceCard__title">{item.name}</h3>
                                    {item.link && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="experienceCard__text experienceCard__text--link"
                                        >
                                            {t("experience.projects.linkLabel")}
                                        </a>
                                    )}
                                    {item.description && (
                                        <div className="experienceCard__text">{item.description}</div>
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
